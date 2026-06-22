import { useMemo, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { WebView, type WebViewMessageEvent } from 'react-native-webview';

import { colors, spacing } from '@/theme';
import type { MountainWithProgress } from '@/types/models';

interface KoreaMountainMapProps {
  mountains: MountainWithProgress[];
  onSelect: (mountain: MountainWithProgress) => void;
}

function buildHtml(mountains: MountainWithProgress[]): string {
  const data = JSON.stringify(mountains.map(({ id, nameKo, latitude, longitude, climbed }) => ({ id, nameKo, latitude, longitude, climbed })))
    .replaceAll('<', '\\u003c');
  return `<!doctype html>
  <html lang="ko"><head><meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
  <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
  <style>html,body,#map{height:100%;margin:0;background:#E9DFC8}.leaflet-control-attribution{font-size:9px}.mountain-marker{width:32px;height:32px;border-radius:18px;background:#173F32;border:3px solid #fff;color:#fff;display:flex;align-items:center;justify-content:center;box-shadow:0 3px 9px #0004;font-size:16px}.mountain-marker.done{background:#B74D45;border-color:#FFE8D8;font-weight:900}.leaflet-tooltip{font-family:-apple-system,BlinkMacSystemFont,sans-serif;font-weight:800;border:0;border-radius:8px;box-shadow:0 2px 8px #0002}</style></head>
  <body><div id="map"></div><script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script><script>
  const map=L.map('map',{zoomControl:false,minZoom:6,maxZoom:15}).setView([36.35,127.8],7);
  L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png',{maxZoom:19,attribution:'© OpenStreetMap 기여자'}).addTo(map);
  const mountains=${data};
  mountains.forEach(m=>{const icon=L.divIcon({className:'',html:'<div class="mountain-marker '+(m.climbed?'done':'')+'">'+(m.climbed?'✓':'▲')+'</div>',iconSize:[38,38],iconAnchor:[19,19]});const marker=L.marker([m.latitude,m.longitude],{icon}).addTo(map);marker.bindTooltip(m.nameKo,{direction:'top',offset:[0,-16]});marker.on('click',()=>window.ReactNativeWebView.postMessage(JSON.stringify({type:'select',id:m.id})));});
  </script></body></html>`;
}

export function KoreaMountainMap({ mountains, onSelect }: KoreaMountainMapProps) {
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);
  const html = useMemo(() => buildHtml(mountains), [mountains]);
  const onMessage = (event: WebViewMessageEvent) => {
    try {
      const message = JSON.parse(event.nativeEvent.data) as { type?: string; id?: string };
      if (message.type === 'select') {
        const mountain = mountains.find((item) => item.id === message.id);
        if (mountain) onSelect(mountain);
      }
    } catch { /* 지도에서 온 잘못된 메시지는 무시한다. */ }
  };
  return (
    <View style={styles.container}>
      <WebView originWhitelist={['*']} source={{ html }} onMessage={onMessage} onLoadEnd={() => setLoading(false)} onError={() => setFailed(true)} javaScriptEnabled domStorageEnabled />
      {loading && <View style={styles.overlay}><ActivityIndicator color={colors.forest} /><Text style={styles.message}>지도를 불러오는 중이에요</Text></View>}
      {failed && <View style={styles.overlay}><Text style={styles.message}>지도를 불러오지 못했어요. 인터넷 연결을 확인해 주세요.</Text></View>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.beige },
  overlay: { position: 'absolute', top: 0, right: 0, bottom: 0, left: 0, alignItems: 'center', justifyContent: 'center', gap: spacing.sm, backgroundColor: colors.sand },
  message: { color: colors.muted, fontSize: 13, textAlign: 'center', paddingHorizontal: spacing.xl },
});
