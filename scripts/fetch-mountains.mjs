import { mkdir, writeFile } from 'node:fs/promises';

const OUT_PATH = new URL('../src/data/mountains.json', import.meta.url);
const OVERPASS_URLS = [
  'https://overpass-api.de/api/interpreter',
  'https://overpass.private.coffee/api/interpreter',
  'https://overpass.kumi.systems/api/interpreter',
];

// 대표 산은 앱의 필수 목록이므로 OSM 응답 상태와 무관하게 검증된 좌표로 유지한다.
const famous = [
  ['hallasan', '한라산', '제주특별자치도', 1947, 33.3617, 126.5292],
  ['jirisan', '지리산', '경상남도', 1915, 35.3369, 127.7306],
  ['seoraksan', '설악산', '강원특별자치도', 1708, 38.119, 128.4652],
  ['bukhansan', '북한산', '서울특별시', 836, 37.6587, 126.9779],
  ['gwanaksan', '관악산', '서울특별시', 632, 37.445, 126.9641],
  ['dobongsan', '도봉산', '서울특별시', 740, 37.6983, 127.0154],
  ['sobaeksan', '소백산', '충청북도', 1439, 36.9574, 128.4849],
  ['odaesan', '오대산', '강원특별자치도', 1563, 37.7947, 128.5437],
  ['taebaeksan', '태백산', '강원특별자치도', 1567, 37.0956, 128.9167],
  ['mudeungsan', '무등산', '광주광역시', 1187, 35.1188, 127.0028],
  ['gyeryongsan', '계룡산', '충청남도', 845, 36.3424, 127.2052],
  ['woraksan', '월악산', '충청북도', 1097, 36.885, 128.1057],
  ['songnisan', '속리산', '충청북도', 1058, 36.543, 127.87],
  ['gayasan', '가야산', '경상남도', 1433, 35.8229, 128.1205],
  ['palgongsan', '팔공산', '대구광역시', 1193, 36.0164, 128.6954],
  ['naejangsan', '내장산', '전북특별자치도', 763, 35.4785, 126.889],
  ['chiaksan', '치악산', '강원특별자치도', 1288, 37.3715, 128.0506],
  ['deogyusan', '덕유산', '전북특별자치도', 1614, 35.8606, 127.7463],
  ['manisan', '마니산', '인천광역시', 472, 37.6127, 126.4354],
  ['cheonggyesan', '청계산', '서울특별시', 618, 37.4278, 127.0437],
  ['suraksan', '수락산', '서울특별시', 638, 37.6995, 127.0812],
  ['buramsan', '불암산', '서울특별시', 510, 37.6649, 127.0958],
  ['yongmunsan', '용문산', '경기도', 1157, 37.5622, 127.5485],
  ['gamaksan', '감악산', '경기도', 675, 37.9415, 126.969],
  ['myeongjisan', '명지산', '경기도', 1267, 37.9425, 127.4328],
  ['unaksan', '운악산', '경기도', 936, 37.8788, 127.3226],
  ['yumyeongsan', '유명산', '경기도', 862, 37.5753, 127.4869],
  ['daedunsan', '대둔산', '충청남도', 878, 36.1217, 127.3206],
  ['geumjeongsan', '금정산', '부산광역시', 801, 35.2831, 129.0556],
  ['jangsan', '장산', '부산광역시', 634, 35.2009, 129.163],
].map(([id, nameKo, region, altitudeMeters, latitude, longitude]) => ({
  id,
  nameKo,
  region,
  altitudeMeters,
  latitude,
  longitude,
  description: `${region}의 대표 산으로, 산도장에서 완등 기록을 남길 수 있어요.`,
}));

function inferRegion(latitude, longitude) {
  if (latitude < 34.1) return '제주특별자치도';
  if (latitude > 37.42 && longitude < 127.19) return '수도권';
  if (latitude > 37.0 && longitude >= 127.19) return '강원특별자치도';
  if (longitude > 128.7 && latitude < 35.45) return '부산·울산';
  if (longitude > 128.0 && latitude < 36.2) return '경상권';
  if (longitude < 127.2 && latitude < 36.2) return '전라권';
  if (latitude < 37.1) return '충청권';
  return '대한민국';
}

async function fetchOsmMountains() {
  const query = `[out:json][timeout:90];area["ISO3166-1"="KR"][admin_level=2]->.a;nwr["natural"="peak"]["name:ko"]["ele"](area.a);out center 500;`;
  let payload;
  const errors = [];
  for (const endpoint of OVERPASS_URLS) {
    try {
      const response = await fetch(`${endpoint}?data=${encodeURIComponent(query)}`);
      if (!response.ok) throw new Error(`${response.status}`);
      payload = await response.json();
      break;
    } catch (error) {
      errors.push(`${endpoint}: ${error.message}`);
    }
  }
  if (!payload) throw new Error(errors.join(', '));
  return payload.elements.flatMap((element) => {
    const latitude = element.lat ?? element.center?.lat;
    const longitude = element.lon ?? element.center?.lon;
    const nameKo = element.tags?.['name:ko'];
    const altitudeMeters = Number.parseInt(element.tags?.ele, 10);
    if (!nameKo || !Number.isFinite(latitude) || !Number.isFinite(longitude)) return [];
    if (!Number.isFinite(altitudeMeters) || altitudeMeters < 100 || altitudeMeters > 2500) return [];
    if (!/[산봉대]$/.test(nameKo)) return [];
    const region = element.tags?.['addr:province'] ?? inferRegion(latitude, longitude);
    return [{
      id: `osm-${element.type}-${element.id}`,
      nameKo,
      region,
      altitudeMeters,
      latitude,
      longitude,
      description: `OpenStreetMap에 등록된 ${altitudeMeters}m 높이의 산이에요.`,
    }];
  });
}

async function main() {
  let osm = [];
  try {
    osm = await fetchOsmMountains();
  } catch (error) {
    console.warn(`OSM 수집에 실패해 대표 산 목록만 사용합니다: ${error.message}`);
  }
  const byName = new Map(famous.map((mountain) => [mountain.nameKo, mountain]));
  for (const mountain of osm) {
    if (!byName.has(mountain.nameKo)) byName.set(mountain.nameKo, mountain);
    if (byName.size >= 130) break;
  }
  const mountains = [...byName.values()].sort((a, b) => a.nameKo.localeCompare(b.nameKo, 'ko'));
  await mkdir(new URL('../src/data/', import.meta.url), { recursive: true });
  await writeFile(OUT_PATH, `${JSON.stringify(mountains, null, 2)}\n`, 'utf8');
  console.log(`${mountains.length}개 산을 ${OUT_PATH.pathname}에 저장했습니다.`);
}

await main();
