// api/search-routes.js
// Vercel Serverless Function for route search

const GOOGLE_MAPS_API_KEY = 'AIzaSyBxL_W0AqcoUWRoIF-vfjDxc-bo7qdVGmM';

export default async function handler(req, res) {
  // CORSヘッダー設定
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,POST');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { origin, destination, arrivalTime, departureTime, priority } = req.body;

    if (!origin || !destination) {
      return res.status(400).json({ error: '出発地と目的地は必須です' });
    }

    // Google Maps Directions APIのパラメータ設定
    const baseParams = {
      origin,
      destination,
      mode: 'transit',
      language: 'ja',
      region: 'JP',
      key: GOOGLE_MAPS_API_KEY,
      alternatives: true, // 複数ルート取得
    };

    // 到着時刻または出発時刻の設定
    if (arrivalTime) {
      baseParams.arrival_time = Math.floor(new Date(arrivalTime).getTime() / 1000);
    } else if (departureTime) {
      baseParams.departure_time = Math.floor(new Date(departureTime).getTime() / 1000);
    } else {
      baseParams.departure_time = 'now';
    }

    // 優先順位に応じた設定
    const transitPreferences = {
      fastest: 'fewer_transfers', // 最速(乗換少なめで速度優先)
      cheapest: 'less_walking', // 最安(徒歩少なめ)
      fewest_transfers: 'fewer_transfers', // 乗換少
    };

    if (priority && transitPreferences[priority]) {
      baseParams.transit_routing_preference = transitPreferences[priority];
    }

    // APIリクエスト
    const params = new URLSearchParams(baseParams);
    const apiUrl = `https://maps.googleapis.com/maps/api/directions/json?${params}`;

    const response = await fetch(apiUrl);
    const data = await response.json();

    if (data.status !== 'OK') {
      return res.status(400).json({ 
        error: 'ルート検索に失敗しました',
        details: data.status 
      });
    }

    // ルート情報の整形
    const routes = data.routes.map((route, index) => {
      const leg = route.legs[0];
      const steps = leg.steps;

      // 料金情報の取得(存在する場合)
      let fare = null;
      if (leg.fare) {
        fare = {
          value: leg.fare.value,
          currency: leg.fare.currency,
          text: leg.fare.text
        };
      }

      // 乗換回数の計算(transit stepの数 - 1)
      const transitSteps = steps.filter(step => step.travel_mode === 'TRANSIT');
      const transfers = Math.max(0, transitSteps.length - 1);

      // セグメント情報の整形
      const segments = steps.map(step => {
        if (step.travel_mode === 'WALKING') {
          return {
            type: 'walk',
            duration: step.duration.value,
            durationText: step.duration.text,
            distance: step.distance.value,
            distanceText: step.distance.text,
            instructions: step.html_instructions.replace(/<[^>]*>/g, '')
          };
        } else if (step.travel_mode === 'TRANSIT') {
          const transit = step.transit_details;
          return {
            type: 'transit',
            line: {
              name: transit.line.name,
              shortName: transit.line.short_name || transit.line.name,
              vehicle: transit.line.vehicle.type,
              color: transit.line.color || '#4CAF50',
              textColor: transit.line.text_color || '#FFFFFF',
              agency: transit.line.agencies?.[0]?.name || ''
            },
            departure: {
              name: transit.departure_stop.name,
              time: new Date(transit.departure_time.value * 1000).toLocaleTimeString('ja-JP', {
                hour: '2-digit',
                minute: '2-digit'
              })
            },
            arrival: {
              name: transit.arrival_stop.name,
              time: new Date(transit.arrival_time.value * 1000).toLocaleTimeString('ja-JP', {
                hour: '2-digit',
                minute: '2-digit'
              })
            },
            duration: step.duration.value,
            durationText: step.duration.text,
            numStops: transit.num_stops,
            headsign: transit.headsign
          };
        }
        return null;
      }).filter(Boolean);

      return {
        id: `route_${index}`,
        duration: leg.duration.value,
        durationText: leg.duration.text,
        distance: leg.distance.value,
        distanceText: leg.distance.text,
        fare: fare,
        transfers: transfers,
        departureTime: leg.departure_time.text,
        arrivalTime: leg.arrival_time.text,
        segments: segments,
        summary: route.summary
      };
    });

    // 優先順位に応じたソート
    let sortedRoutes = [...routes];
    if (priority === 'fastest') {
      sortedRoutes.sort((a, b) => a.duration - b.duration);
    } else if (priority === 'cheapest') {
      sortedRoutes.sort((a, b) => {
        if (!a.fare && !b.fare) return a.duration - b.duration;
        if (!a.fare) return 1;
        if (!b.fare) return -1;
        return a.fare.value - b.fare.value;
      });
    } else if (priority === 'fewest_transfers') {
      sortedRoutes.sort((a, b) => {
        if (a.transfers === b.transfers) {
          return a.duration - b.duration;
        }
        return a.transfers - b.transfers;
      });
    }

    res.status(200).json({
      success: true,
      routes: sortedRoutes.slice(0, 4), // 最大4件
      origin: {
        address: leg.start_address,
        location: leg.start_location
      },
      destination: {
        address: leg.end_address,
        location: leg.end_location
      }
    });

  } catch (error) {
    console.error('Route search error:', error);
    res.status(500).json({ 
      error: 'サーバーエラーが発生しました',
      details: error.message 
    });
  }
}
