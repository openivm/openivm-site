import { engineInfo } from './metrics.ts';

const assets: Record<string, string> = {
  spark: 'apachespark.svg', 'spark-openivm': 'apachespark.svg',
  duckdb: 'duckdb.svg', 'duckdb-openivm': 'duckdb.svg',
  feldera: 'feldera.svg', dbspnet: 'dotnet.svg', risingwave: 'risingwave.png',
  'materialize-emulator': 'materialize.svg',
};
const asset = (id: string) => assets[id] && `/icons/${assets[id]}`;
const openivm = (id: string) => id.endsWith('-openivm');

export function EngineIcon({ id }: { id: string }) {
  const src = asset(id);
  return <span class={`engine-icon ${id}${openivm(id) ? ' is-openivm' : ''}${id === 'risingwave' ? ' brand-color' : ''}`} title={engineInfo(id)[0]} aria-hidden="true">
    {src ? <img src={src} alt="" /> : <svg viewBox="0 0 24 24"><path d="M4 8 12 4l8 4-8 4-8-4Zm0 4 8 4 8-4M4 16l8 4 8-4" fill="none" stroke="currentColor" stroke-width="2" /></svg>}
    {openivm(id) && <span class="engine-icon-openivm">+</span>}
  </span>;
}

export function EngineMarker({ id, x, y, color }: { id: string; x: number; y: number; color: string }) {
  const src = asset(id);
  return <g class="engine-marker" aria-hidden="true">
    {openivm(id)
      ? <rect x={x - 10} y={y - 10} width="20" height="20" rx="3" fill="#171025" stroke={color} stroke-width="1.5" />
      : <circle cx={x} cy={y} r="10" fill="#171025" stroke={color} stroke-width="1.5" />}
    {src
      ? <image href={src} x={x - 6} y={y - 6} width="12" height="12" class={id === 'risingwave' ? '' : 'engine-marker-monochrome'} />
      : <path d={`M${x - 4} ${y} l4 -3 4 3 -4 3z`} fill="none" stroke="white" />}
    {openivm(id) && <g><circle cx={x + 5} cy={y - 5} r="4.5" fill="#fff1ff" /><path d={`M${x + 2.5} ${y - 5}h5 M${x + 5} ${y - 7.5}v5`} stroke="#28142d" stroke-width="1.7" /></g>}
  </g>;
}
