"use client";

// ============================================================
// UnifiedReport — Báo cáo SPI Techzen (Phiên bản cải tiến)
// Nhận dữ liệu dạng UnifiedReportData từ unifiedScoring.ts
// Thiết kế: Gauge Chart + Tab Navigation + Role Matrix + AI Card
// ============================================================

import React, { useState, useMemo } from 'react';
import type { UnifiedReportData, UnifiedGroup, UnifiedScoreItem } from '../utils/unifiedScoring';
import type { AIReport } from '../utils/openaiService';
import { detectPersonaRanked } from '../data/aiAnalysis';
import type { DimensionScore } from '../data/scoring';

// ─── PROPS ────────────────────────────────────────────────────
interface UnifiedReportProps {
  data: UnifiedReportData;
  aiReport?: AIReport | null;
  candidateName?: string;
  reportDate?: Date;
}

// ─── NHÃN MỨC ĐỘ ─────────────────────────────────────────────
function getScoreLabel(score: number): { text: string; color: string; bg: string } {
  if (score >= 8.5) return { text: 'Xuất sắc',       color: '#059669', bg: '#D1FAE5' };
  if (score >= 7.0) return { text: 'Tốt',             color: '#2563EB', bg: '#DBEAFE' };
  if (score >= 5.0) return { text: 'Trung bình',      color: '#D97706', bg: '#FEF3C7' };
  if (score >= 3.0) return { text: 'Cần phát triển',  color: '#DC2626', bg: '#FEE2E2' };
  return               { text: 'Yếu',              color: '#7C3AED', bg: '#EDE9FE' };
}

// ─── SEMI-CIRCLE GAUGE SVG ────────────────────────────────────
function GaugeChart({ value, max = 10, color, size = 100 }: {
  value: number; max?: number; color: string; size?: number;
}) {
  const pct = Math.min(1, Math.max(0, value / max));
  const r = size * 0.38;
  const cx = size / 2;
  const cy = size * 0.58;

  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const startDeg = -180, endDeg = 0;
  const arcX = (deg: number) => cx + r * Math.cos(toRad(deg));
  const arcY = (deg: number) => cy + r * Math.sin(toRad(deg));
  const valDeg = startDeg + pct * (endDeg - startDeg);

  const bgPath = `M ${arcX(startDeg)} ${arcY(startDeg)} A ${r} ${r} 0 0 1 ${arcX(endDeg)} ${arcY(endDeg)}`;
  const fgPath = pct > 0.001
    ? `M ${arcX(startDeg)} ${arcY(startDeg)} A ${r} ${r} 0 ${pct > 0.5 ? 1 : 0} 1 ${arcX(valDeg)} ${arcY(valDeg)}`
    : '';

  return (
    <svg width={size} height={size * 0.65} viewBox={`0 0 ${size} ${size * 0.65}`}>
      <path d={bgPath} fill="none" stroke="#E5E7EB" strokeWidth={size * 0.09} strokeLinecap="round" />
      {fgPath && (
        <path d={fgPath} fill="none" stroke={color} strokeWidth={size * 0.09} strokeLinecap="round"
          style={{ transition: 'all 0.8s ease-out' }} />
      )}
      <text x={cx} y={cy - 2} textAnchor="middle" fill={color}
        fontSize={size * 0.22} fontWeight="700" fontFamily="system-ui">
        {value.toFixed(1)}
      </text>
      <text x={cx} y={cy + size * 0.13} textAnchor="middle" fill="#9CA3AF"
        fontSize={size * 0.1} fontFamily="system-ui">/10</text>
    </svg>
  );
}

// ─── RADAR CHART SVG ──────────────────────────────────────────
function RadarChart({ groups, size = 280 }: { groups: UnifiedGroup[]; size?: number }) {
  // Lấy 1 item tiêu biểu nhất của mỗi nhóm (bỏ integrity)
  const points = groups
    .filter(g => g.id !== 'integrity' && g.id !== 'leadership')
    .flatMap(g => g.items.slice(0, 3))
    .slice(0, 16);

  const n = points.length;
  if (n < 3) return null;

  const cx = size / 2, cy = size / 2;
  const r = size * 0.38;
  const angleStep = (2 * Math.PI) / n;

  // Round 4 chữ số để tránh floating point mismatch SSR vs Client
  const r4 = (n: number) => Math.round(n * 10000) / 10000;
  const ptX = (i: number, radius: number) => r4(cx + radius * Math.sin(i * angleStep));
  const ptY = (i: number, radius: number) => r4(cy - radius * Math.cos(i * angleStep));

  const gridLevels = [0.2, 0.4, 0.6, 0.8, 1.0];

  // Data polygon
  const dataPath = points
    .map((p, i) => {
      const frac = (p.score ?? 0) / 10;
      return `${i === 0 ? 'M' : 'L'} ${ptX(i, r * frac)} ${ptY(i, r * frac)}`;
    }).join(' ') + ' Z';

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      {/* Grid */}
      {gridLevels.map((lvl, li) => {
        const d = Array.from({ length: n }, (_, i) => `${i === 0 ? 'M' : 'L'} ${ptX(i, r * lvl)} ${ptY(i, r * lvl)}`).join(' ') + ' Z';
        return <path key={li} d={d} fill="none" stroke="#E5E7EB" strokeWidth={li === 4 ? 1.5 : 0.8} />;
      })}
      {/* Spokes */}
      {Array.from({ length: n }, (_, i) => (
        <line key={i} x1={cx} y1={cy} x2={ptX(i, r)} y2={ptY(i, r)} stroke="#E5E7EB" strokeWidth={0.8} />
      ))}
      {/* Data */}
      <path d={dataPath} fill="rgba(59,130,246,0.15)" stroke="#3B82F6" strokeWidth={2} />
      {points.map((_, i) => {
        const frac = (points[i].score ?? 0) / 10;
        return <circle key={i} cx={ptX(i, r * frac)} cy={ptY(i, r * frac)} r={3.5} fill="#3B82F6" stroke="white" strokeWidth={1.5} />;
      })}
      {/* Labels */}
      {points.map((p, i) => (
        <text key={i} x={ptX(i, r + 20)} y={ptY(i, r + 20)}
          textAnchor="middle" dominantBaseline="middle"
          fontSize={9} fill="#374151" fontFamily="system-ui">
          {p.label.split(' ')[0]}
        </text>
      ))}
    </svg>
  );
}

// ─── DIMENSION ROW ─────────────────────────────────────────────
function DimRow({ item, color }: { item: UnifiedScoreItem; color: string }) {
  const label = getScoreLabel(item.score);
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 10,
      padding: '9px 12px', borderRadius: 10,
      background: '#FAFAFA', border: '1px solid #F0F0F0', marginBottom: 6,
    }}>
      <div style={{ flex: 1 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
          <span style={{ fontWeight: 600, fontSize: 13, color: '#1F2937' }}>{item.label}</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ fontWeight: 700, fontSize: 15, color }}>{item.score.toFixed(1)}</span>
            <span style={{
              fontSize: 10, fontWeight: 600, padding: '2px 7px', borderRadius: 20,
              color: label.color, background: label.bg, whiteSpace: 'nowrap',
            }}>{label.text}</span>
          </div>
        </div>
        <div style={{ height: 5, background: '#E5E7EB', borderRadius: 3, overflow: 'hidden' }}>
          <div style={{
            height: '100%', width: `${(item.score / 10) * 100}%`,
            background: `linear-gradient(90deg, ${color}88, ${color})`,
            borderRadius: 3, transition: 'width 0.8s ease-out',
          }} />
        </div>
        {item.description && (
          <p style={{ fontSize: 11, color: '#6B7280', margin: '3px 0 0', lineHeight: 1.4 }}>
            {item.description.split('.')[0]}.
          </p>
        )}
      </div>
    </div>
  );
}

// ─── ROLE BAR ─────────────────────────────────────────────────
function RoleBar({ role, score, icon, description }: { role: string; score: number; icon: string; description: string }) {
  const pct = Math.round(score);
  const color = pct >= 75 ? '#059669' : pct >= 55 ? '#2563EB' : pct >= 40 ? '#D97706' : '#DC2626';
  const label = pct >= 75 ? '✅ Phù hợp cao' : pct >= 55 ? '✅ Phù hợp' : pct >= 40 ? '⚠️ Cần phát triển' : '❌ Chưa phù hợp';
  return (
    <div style={{ marginBottom: 10 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
        <span style={{ fontSize: 13, fontWeight: 600, color: '#1F2937' }}>{icon} {role}</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontWeight: 700, fontSize: 14, color }}>{pct}%</span>
          <span style={{ fontSize: 10, color, fontWeight: 500 }}>{label}</span>
        </div>
      </div>
      <div style={{ height: 8, background: '#E5E7EB', borderRadius: 4, overflow: 'hidden' }}>
        <div style={{
          height: '100%', width: `${pct}%`, borderRadius: 4,
          background: `linear-gradient(90deg, ${color}88, ${color})`,
          transition: 'width 0.8s ease-out',
        }} />
      </div>
      <div style={{ fontSize: 11, color: '#6B7280', marginTop: 5, lineHeight: 1.4, fontStyle: 'italic' }}>
        {description}
      </div>
    </div>
  );
}

// ─── GROUP TAB ─────────────────────────────────────────────────
// Mapping group id sang label Việt + icon cho tab
const GROUP_META: Record<string, { label: string; icon: string; color: string }> = {
  integrity:    { label: 'Tin cậy',    icon: '🛡️',  color: '#6366F1' },
  personality:  { label: 'Tính Cách', icon: '🧬',  color: '#3B82F6' },
  motivation:   { label: 'Ý Chí',     icon: '🔥',  color: '#EF4444' },
  thinking:     { label: 'Tư Duy',    icon: '🧠',  color: '#F59E0B' },
  values:       { label: 'Giá Trị',   icon: '🌿',  color: '#10B981' },
  stress:       { label: 'Áp Lực',    icon: '💪',  color: '#7C3AED' },
  work_ethic:   { label: 'Công việc', icon: '⚙️',  color: '#0EA5E9' },
  social:       { label: 'Xã hội',    icon: '🤝',  color: '#14B8A6' },
};

const ROLE_ICON: Record<string, string> = {
  'Người Mở cõi':       '🎯',
  'Người Cầm lái':      '👑',
  'Chuyên gia Đào sâu': '🔬',
  'Người Chăm chút':    '⚙️',
  'Nhà Sáng tạo':       '🎨',
  'Người Kiến tạo':     '⚡',
  'Cố vấn Phân tích':   '📊',
  'Chất Kết Dính':      '🤝',
};

// ─── MAIN COMPONENT ───────────────────────────────────────────
export default function UnifiedReport({ data, aiReport, candidateName, reportDate }: UnifiedReportProps) {
  // Xác định tab đầu tiên có dữ liệu (bỏ integrity)
  const mainGroups = data.groups.filter(g => g.id !== 'integrity');
  const [activeTab, setActiveTab] = useState<string>(mainGroups[0]?.id ?? 'personality');

  // Điểm tổng hợp (bỏ integrity)
  const overallScore = useMemo(() => {
    const vals = mainGroups.map(g => g.groupScore).filter(s => s > 0);
    return vals.length > 0 ? vals.reduce((a, b) => a + b, 0) / vals.length : 0;
  }, [mainGroups]);

  const integrityGroup = data.groups.find(g => g.id === 'integrity');
  const combatPower = data.combatPower;
  const suitability = data.suitability ?? [];
  const topRole = data.topRole;
  const overallLabel = getScoreLabel(overallScore);

  const activeGroup = mainGroups.find(g => g.id === activeTab);
  const activeMeta = GROUP_META[activeTab] ?? { label: activeTab, icon: '📊', color: '#6B7280' };

  // Top 3 mạnh / 3 yếu
  const allItems = mainGroups.flatMap(g => g.items);
  const topStrong = [...allItems].sort((a, b) => b.score - a.score).slice(0, 3);
  const topWeak   = [...allItems].filter(i => i.score > 0).sort((a, b) => a.score - b.score).slice(0, 3);

  // [v4.1] Top 3 Persona — dùng detectPersonaRanked
  const allDims = mainGroups.flatMap(g => g.items).map(item => ({
    dimensionId: item.id,
    raw: 0,
    scaled: Math.round(item.score),
    scaledContinuous: item.score,
    percentile: Math.round((item.score / 10) * 100),
    count: 1,
    max: 10,
  })) as DimensionScore[];
  const top3Personas = useMemo(() => detectPersonaRanked(allDims), [activeTab]); // eslint-disable-line react-hooks/exhaustive-deps

  // Reliability info
  const reliabilityScore = data.reliabilityScore;
  const interpretationCaveat = data.interpretationCaveat;
  const interpretationConfidence = data.interpretationConfidence ?? 'high';

  return (
    <div style={{
      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
      maxWidth: 920, margin: '0 auto', padding: '0 16px 48px',
      color: '#1F2937',
    }}>

      {/* ══ HEADER ══════════════════════════════════════════════ */}
      <div style={{
        background: 'linear-gradient(135deg, #1E3A8A 0%, #2563EB 60%, #60A5FA 100%)',
        borderRadius: 20, padding: '28px 32px', marginBottom: 24,
        color: 'white', position: 'relative', overflow: 'hidden',
      }}>
        <div style={{ position: 'absolute', right: -20, top: -20, width: 200, height: 200, background: 'rgba(255,255,255,0.05)', borderRadius: '50%' }} />
        <div style={{ position: 'absolute', right: 40, bottom: -40, width: 140, height: 140, background: 'rgba(255,255,255,0.04)', borderRadius: '50%' }} />

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 20 }}>
          <div>
            <div style={{ fontSize: 11, opacity: 0.7, marginBottom: 6, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
              Techzen · Báo Cáo Năng Lực Nhân Sự
            </div>
            <h1 style={{ fontSize: 26, fontWeight: 800, margin: '0 0 10px', letterSpacing: '-0.02em' }}>
              {candidateName ?? 'Kết Quả Đánh Giá'}
            </h1>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
              {topRole && (
                <span style={{
                  background: 'rgba(255,255,255,0.2)', padding: '4px 14px', borderRadius: 20,
                  fontSize: 13, fontWeight: 600, backdropFilter: 'blur(4px)',
                }}>
                  {ROLE_ICON[topRole.role] ?? '🎯'} {topRole.role}
                </span>
              )}
              <span style={{
                background: 'rgba(255,255,255,0.12)', padding: '4px 12px', borderRadius: 20,
                fontSize: 11, opacity: 0.85,
              }}>
                {data.sourceType === 'SPI_DEV_V3_LEGACY' ? 'SPI Dev V3' : 'SPI Universal'}
              </span>
              {reportDate && (
                <span style={{ fontSize: 11, opacity: 0.6 }}>
                  {reportDate.toLocaleDateString('vi-VN')}
                </span>
              )}
            </div>
          </div>

          {/* Điểm tổng */}
          <div style={{
            background: 'rgba(255,255,255,0.12)', borderRadius: 16, padding: '18px 26px',
            textAlign: 'center', border: '1px solid rgba(255,255,255,0.2)',
          }}>
            <div style={{ fontSize: 46, fontWeight: 900, lineHeight: 1 }}>
              {overallScore.toFixed(1)}
            </div>
            <div style={{ fontSize: 11, opacity: 0.7, marginTop: 2 }}>trên thang 10</div>
            <div style={{
              marginTop: 8, fontSize: 12, fontWeight: 700, padding: '3px 12px',
              background: 'rgba(255,255,255,0.22)', borderRadius: 20,
            }}>{overallLabel.text}</div>
          </div>
        </div>

        {/* Reliability strip — [v4.1] hiển thị reliabilityScore dạng progress bar */}
        <div style={{
          marginTop: 20, paddingTop: 16, borderTop: '1px solid rgba(255,255,255,0.15)',
          display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center',
        }}>
          <span style={{ fontSize: 11, opacity: 0.6, marginRight: 4 }}>Độ tin cậy:</span>
          {reliabilityScore != null ? (
            <>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{ width: 100, height: 8, background: 'rgba(255,255,255,0.15)', borderRadius: 4, overflow: 'hidden' }}>
                  <div style={{
                    height: '100%', borderRadius: 4,
                    width: `${reliabilityScore}%`,
                    background: reliabilityScore >= 80 ? '#34D399' : reliabilityScore >= 60 ? '#FBBF24' : reliabilityScore >= 35 ? '#F97316' : '#F87171',
                    transition: 'width 0.8s ease-out',
                  }} />
                </div>
                <span style={{
                  fontSize: 12, fontWeight: 700,
                  background: reliabilityScore >= 80 ? 'rgba(52,211,153,0.25)' : reliabilityScore >= 60 ? 'rgba(251,191,36,0.25)' : reliabilityScore >= 35 ? 'rgba(249,115,22,0.25)' : 'rgba(248,113,113,0.25)',
                  padding: '3px 12px', borderRadius: 20,
                }}>
                  {reliabilityScore >= 80 ? '✅' : reliabilityScore >= 60 ? '🟡' : reliabilityScore >= 35 ? '🟠' : '🔴'}
                  {` ${reliabilityScore}/100`}
                </span>
              </div>
            </>
          ) : (
            <span style={{
              fontSize: 12, fontWeight: 700,
              background: data.integrityLevel === 'ok' ? 'rgba(16,185,129,0.25)' : data.integrityLevel === 'warning' ? 'rgba(245,158,11,0.25)' : 'rgba(239,68,68,0.25)',
              padding: '3px 12px', borderRadius: 20,
            }}>
              {data.integrityLevel === 'ok' ? '✅ Cao' : data.integrityLevel === 'warning' ? '🟡 Trung bình' : '🔴 Rủi ro'}
            </span>
          )}
          {integrityGroup?.items.map(item => (
            <span key={item.id} style={{ fontSize: 11, background: 'rgba(255,255,255,0.1)', padding: '3px 10px', borderRadius: 20 }}>
              {item.label}: <strong>{item.score.toFixed(1)}</strong>
            </span>
          ))}
          {combatPower && (
            <span style={{ fontSize: 11, background: 'rgba(255,255,255,0.15)', padding: '3px 10px', borderRadius: 20, marginLeft: 'auto' }}>
              💼 Chỉ số Năng Lực: <strong>{combatPower.total}</strong>
            </span>
          )}
        </div>
      </div>

      {/* ══ LAYOUT 2 CỘT: RADAR + COMBAT PILLARS ═══════════════ */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 24 }}>

        {/* Radar */}
        <div style={{
          background: 'white', borderRadius: 16, padding: 20,
          boxShadow: '0 1px 6px rgba(0,0,0,0.07)', border: '1px solid #F0F0F0',
          display: 'flex', flexDirection: 'column', alignItems: 'center',
        }}>
          <h3 style={{ margin: '0 0 10px', fontWeight: 700, fontSize: 15, alignSelf: 'flex-start', color: '#374151' }}>
            🕸️ Bản Đồ Năng Lực
          </h3>
          <RadarChart groups={data.groups} size={270} />
        </div>

        {/* Group summary cards */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {mainGroups.slice(0, 5).map(grp => {
            const meta = GROUP_META[grp.id] ?? { label: grp.title, icon: '📊', color: '#6B7280' };
            const label = getScoreLabel(grp.groupScore);
            return (
              <div key={grp.id} style={{
                background: 'white', borderRadius: 12, padding: '12px 16px',
                boxShadow: '0 1px 4px rgba(0,0,0,0.06)', border: '1px solid #F0F0F0',
                display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer',
              }} onClick={() => setActiveTab(grp.id)}>
                <div style={{
                  width: 42, height: 42, borderRadius: 10, fontSize: 20,
                  background: `${meta.color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  {meta.icon}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3 }}>
                    <span style={{ fontWeight: 600, fontSize: 13 }}>{grp.title}</span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                      <span style={{ fontWeight: 800, fontSize: 14, color: meta.color }}>
                        {grp.groupScore.toFixed(1)}
                      </span>
                      <span style={{ fontSize: 10, color: label.color, fontWeight: 600,
                        background: label.bg, padding: '1px 6px', borderRadius: 20 }}>
                        {label.text}
                      </span>
                    </div>
                  </div>
                  <div style={{ height: 4, background: '#F3F4F6', borderRadius: 2, overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${(grp.groupScore / 10) * 100}%`, background: meta.color, borderRadius: 2 }} />
                  </div>
                  <p style={{ fontSize: 10, color: '#9CA3AF', margin: '3px 0 0' }}>{grp.subtitle}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ══ TAB CHI TIẾT ════════════════════════════════════════ */}
      <div style={{
        background: 'white', borderRadius: 16, overflow: 'hidden',
        boxShadow: '0 1px 6px rgba(0,0,0,0.07)', border: '1px solid #F0F0F0', marginBottom: 24,
      }}>
        {/* Tab headers */}
        <div style={{ display: 'flex', borderBottom: '1px solid #F0F0F0', background: '#FAFAFA', overflowX: 'auto' }}>
          {mainGroups.map(g => {
            const meta = GROUP_META[g.id] ?? { label: g.title, icon: '📊', color: '#6B7280' };
            const isA = activeTab === g.id;
            return (
              <button key={g.id} onClick={() => setActiveTab(g.id)} style={{
                flex: 1, minWidth: 80, padding: '11px 6px', border: 'none', background: 'transparent',
                cursor: 'pointer', borderBottom: isA ? `3px solid ${meta.color}` : '3px solid transparent',
                color: isA ? meta.color : '#6B7280', fontWeight: isA ? 700 : 500,
                fontSize: 11, transition: 'all 0.2s', whiteSpace: 'nowrap',
              }}>
                <div style={{ fontSize: 16 }}>{meta.icon}</div>
                {meta.label}
                <div style={{ fontSize: 10, marginTop: 1, fontWeight: 700 }}>
                  {g.groupScore.toFixed(1)}
                </div>
              </button>
            );
          })}
        </div>

        {/* Tab content */}
        <div style={{ padding: '20px 24px' }}>
          {activeGroup && (
            <>
              {/* Group header với gauge */}
              <div style={{
                display: 'flex', alignItems: 'center', gap: 20,
                marginBottom: 20, paddingBottom: 16, borderBottom: '1px solid #F5F5F5',
              }}>
                <GaugeChart value={activeGroup.groupScore} color={activeMeta.color} size={100} />
                <div>
                  <h3 style={{ margin: '0 0 4px', fontWeight: 700, fontSize: 16, color: '#1F2937' }}>
                    {activeMeta.icon} {activeGroup.title}
                  </h3>
                  <p style={{ margin: 0, fontSize: 13, color: '#6B7280' }}>{activeGroup.subtitle}</p>
                </div>
              </div>

              {/* Items */}
              {activeGroup.items.map(item => (
                <DimRow key={item.id} item={item} color={activeMeta.color} />
              ))}
            </>
          )}
        </div>
      </div>

      {/* ══ TOP 3 PERSONA — [v4.1] ══════════════════════════════ */}
      {top3Personas.length > 0 && (
        <div style={{
          background: 'white', borderRadius: 16, padding: '20px 24px',
          boxShadow: '0 1px 6px rgba(0,0,0,0.07)', border: '1px solid #F0F0F0', marginBottom: 24,
        }}>
          {/* Section header — Tầng 3: Diễn giải */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
            <h3 style={{ margin: 0, fontWeight: 700, fontSize: 16, color: '#1F2937' }}>
              🧬 Hồ Sơ Cốt Cách (Persona)
            </h3>
            <span style={{
              fontSize: 10, fontWeight: 600, padding: '3px 10px', borderRadius: 20,
              background: '#F5F3FF', color: '#7C3AED', border: '1px solid #DDD6FE',
            }}>💡 Tầng Diễn Giải</span>
          </div>
          <p style={{ margin: '0 0 16px', fontSize: 12, color: '#6B7280' }}>
            Phân tích tương đồng với 7 archetype nhân sự. Khoảng cách giữa lý thuyết và thực tế được tính bằng RMSE.
          </p>

          {/* Caveat banner nếu cần */}
          {interpretationCaveat && (
            <div style={{
              marginBottom: 16, padding: '10px 14px', borderRadius: 10,
              background: interpretationConfidence === 'low' ? '#FFF7ED' : '#FFFBEB',
              border: `1px solid ${interpretationConfidence === 'low' ? '#FED7AA' : '#FDE68A'}`,
              fontSize: 12, color: interpretationConfidence === 'low' ? '#9A3412' : '#92400E',
            }}>
              {interpretationCaveat}
            </div>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 14 }}>
            {top3Personas.map((item, idx) => {
              const isTop = idx === 0;
              const confidenceColor = item.confidence === 'high' ? '#059669' : item.confidence === 'medium' ? '#D97706' : '#6B7280';
              const confidenceLabel = item.confidence === 'high' ? 'Phù hợp rõ' : item.confidence === 'medium' ? 'Có thể phù hợp' : 'Tham khảo';
              return (
                <div key={idx} style={{
                  borderRadius: 14, padding: '16px',
                  background: isTop ? 'linear-gradient(135deg, #F0F9FF, #E0F2FE)' : '#FAFAFA',
                  border: isTop ? '2px solid #BAE6FD' : '1px solid #E5E7EB',
                  position: 'relative', overflow: 'hidden',
                }}>
                  {isTop && (
                    <span style={{
                      position: 'absolute', top: 8, right: 8,
                      fontSize: 9, fontWeight: 700, padding: '2px 8px', borderRadius: 20,
                      background: '#0EA5E9', color: 'white',
                    }}>✦ PHÙ HỢP NHẤT</span>
                  )}
                  <div style={{ fontSize: 32, marginBottom: 8 }}>{item.persona.emoji}</div>
                  <div style={{ fontWeight: 700, fontSize: 14, color: '#1F2937', marginBottom: 4 }}>
                    {item.persona.title}
                  </div>
                  {/* Match score bar */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                    <div style={{ flex: 1, height: 6, background: '#E5E7EB', borderRadius: 3, overflow: 'hidden' }}>
                      <div style={{
                        height: '100%', borderRadius: 3,
                        width: `${item.matchScore}%`,
                        background: isTop ? '#0EA5E9' : '#94A3B8',
                        transition: 'width 0.8s ease-out',
                      }} />
                    </div>
                    <span style={{ fontSize: 12, fontWeight: 700, color: isTop ? '#0369A1' : '#64748B', whiteSpace: 'nowrap' }}>
                      {item.matchScore}%
                    </span>
                  </div>
                  <span style={{
                    fontSize: 10, fontWeight: 600, padding: '2px 8px', borderRadius: 20,
                    color: confidenceColor,
                    background: item.confidence === 'high' ? '#D1FAE5' : item.confidence === 'medium' ? '#FEF3C7' : '#F3F4F6',
                  }}>{confidenceLabel}</span>
                  <p style={{ fontSize: 11, color: '#6B7280', margin: '8px 0 0', lineHeight: 1.5 }}>
                    {item.persona.bestEnvironment}
                  </p>
                  <p style={{ fontSize: 10, color: '#F59E0B', margin: '6px 0 0', lineHeight: 1.4, fontStyle: 'italic' }}>
                    ⚠ {item.persona.watchOut}
                  </p>
                </div>
              );
            })}
          </div>

          {/* Lưu ý về dual-type nếu rank1 và rank2 sát nhau */}
          {top3Personas.length >= 2 && top3Personas[0].matchScore - top3Personas[1].matchScore < 8 && (
            <div style={{
              marginTop: 14, padding: '10px 14px', background: '#EFF6FF',
              borderRadius: 10, border: '1px solid #BFDBFE', fontSize: 12, color: '#1D4ED8',
            }}>
              💡 <strong>Hồ sơ 2 chiều:</strong> Sự khác biệt giữa <em>{top3Personas[0].persona.title}</em> và <em>{top3Personas[1].persona.title}</em> rất nhỏ — người này có thể linh hoạt thể hiện cả hai phong cách tùy bối cảnh.
            </div>
          )}
        </div>
      )}

      {/* ══ PHÙ HỢP VAI TRÒ ════════════════════════════════════ */}
      {suitability.length > 0 && (
        <div style={{
          background: 'white', borderRadius: 16, padding: '20px 24px',
          boxShadow: '0 1px 6px rgba(0,0,0,0.07)', border: '1px solid #F0F0F0', marginBottom: 24,
        }}>
          <h3 style={{ margin: '0 0 16px', fontWeight: 700, fontSize: 16, color: '#1F2937' }}>
            🎯 Mức Độ Phù Hợp Theo Vị Trí
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px 28px' }}>
            {suitability.map(s => (
              <RoleBar key={s.role} role={s.role} score={s.matchScore} icon={ROLE_ICON[s.role] ?? '📌'} description={s.description} />
            ))}
          </div>
          {topRole && (
            <div style={{
              marginTop: 16, padding: '12px 16px', background: '#F0FDF4',
              borderRadius: 10, border: '1px solid #BBF7D0', display: 'flex', gap: 10, alignItems: 'center',
            }}>
              <span style={{ fontSize: 22 }}>{ROLE_ICON[topRole.role] ?? '🎯'}</span>
              <div>
                <div style={{ fontWeight: 700, color: '#166534', fontSize: 14 }}>
                  Vai trò phù hợp nhất: {topRole.role} ({topRole.matchScore}%)
                </div>
                <p style={{ margin: 0, fontSize: 12, color: '#15803D' }}>
                  {topRole.positions?.join(' · ')}
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ══ 3 CỘT: ĐIỂM MẠNH / CẦN PHÁT TRIỂN / DATA SOURCE ═══ */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16, marginBottom: 24 }}>

        {/* Điểm mạnh */}
        <div style={{ background: '#F0FDF4', borderRadius: 16, padding: '16px 18px', border: '1px solid #BBF7D0' }}>
          <h4 style={{ margin: '0 0 12px', fontWeight: 700, fontSize: 14, color: '#166534' }}>💪 Điểm Mạnh Nổi Trội</h4>
          {topStrong.map((item, i) => (
            <div key={`strong-${i}-${item.id}`} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '7px 0', borderBottom: '1px solid #DCFCE7' }}>
              <span style={{ fontSize: 12, color: '#15803D', fontWeight: 500 }}>{item.label}</span>
              <span style={{ fontWeight: 800, fontSize: 14, color: '#166534', background: '#BBF7D0', padding: '1px 8px', borderRadius: 20 }}>
                {item.score.toFixed(1)}
              </span>
            </div>
          ))}
        </div>

        {/* Cần phát triển */}
        <div style={{ background: '#FFF7ED', borderRadius: 16, padding: '16px 18px', border: '1px solid #FED7AA' }}>
          <h4 style={{ margin: '0 0 12px', fontWeight: 700, fontSize: 14, color: '#9A3412' }}>📈 Cần Phát Triển</h4>
          {topWeak.map((item, i) => (
            <div key={`weak-${i}-${item.id}`} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '7px 0', borderBottom: '1px solid #FED7AA' }}>
              <span style={{ fontSize: 12, color: '#C2410C', fontWeight: 500 }}>{item.label}</span>
              <span style={{ fontWeight: 800, fontSize: 14, color: '#9A3412', background: '#FED7AA', padding: '1px 8px', borderRadius: 20 }}>
                {item.score.toFixed(1)}
              </span>
            </div>
          ))}
        </div>

        {/* Thông tin nguồn */}
        <div style={{ background: '#F5F3FF', borderRadius: 16, padding: '16px 18px', border: '1px solid #DDD6FE' }}>
          <h4 style={{ margin: '0 0 12px', fontWeight: 700, fontSize: 14, color: '#5B21B6' }}>📊 Thông Tin Đánh Giá</h4>
          {[
            { label: 'Loại bài', value: data.sourceType === 'SPI_DEV_V3_LEGACY' ? 'SPI Dev V3' : 'SPI Universal' },
            { label: 'Tổng nhóm', value: `${mainGroups.length} nhóm` },
            { label: 'Tổng chỉ số', value: `${allItems.length} chỉ số` },
            { label: 'Độ tin cậy', value: data.integrityLevel === 'ok' ? 'Cao ✅' : data.integrityLevel === 'warning' ? 'Trung bình 🟡' : 'Rủi ro 🔴' },
            combatPower ? { label: '💼 Chỉ số Năng Lực', value: `${combatPower.total}/100` } : null,
            reliabilityScore != null ? { label: '🎯 Điểm Tin Cậy', value: `${reliabilityScore}/100` } : null,
          ].filter(Boolean).map((item, i) => (
            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '5px 0', borderBottom: '1px solid #EDE9FE' }}>
              <span style={{ fontSize: 11, color: '#7C3AED' }}>{item!.label}</span>
              <span style={{ fontSize: 11, fontWeight: 700, color: '#5B21B6' }}>{item!.value}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ══ AI ASSESSMENT CARD — "Đọc Vị Nhân Sự" ═══════════════ */}
      <div style={{
        background: 'linear-gradient(135deg, #0F172A 0%, #1E293B 100%)',
        borderRadius: 20, padding: '28px 32px',
        boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
        color: 'white',
      }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 24 }}>
          <div style={{
            width: 48, height: 48, borderRadius: 14, fontSize: 24,
            background: 'linear-gradient(135deg, #6366F1, #8B5CF6)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 4px 12px rgba(99,102,241,0.4)',
          }}>🔮</div>
          <div>
            <h3 style={{ margin: 0, fontWeight: 800, fontSize: 18, color: 'white' }}>
              Đọc Vị Nhân Sự — AI Analysis
            </h3>
            <p style={{ margin: 0, fontSize: 11, color: '#94A3B8' }}>
              Chuyên gia Tâm lý học Tổ chức · SPI SOTA · Techzen
            </p>
          </div>
        </div>

        {aiReport && (aiReport as any).personaTitle ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

            {/* ── 1. Độ tin cậy ──────────────────────────────────── */}
            <div style={{
              background: (aiReport as any).reliabilityAlert ? 'rgba(239,68,68,0.12)' : 'rgba(16,185,129,0.12)',
              border: `1px solid ${(aiReport as any).reliabilityAlert ? 'rgba(239,68,68,0.35)' : 'rgba(16,185,129,0.35)'}`,
              borderRadius: 12, padding: '14px 18px', display: 'flex', gap: 12, alignItems: 'flex-start',
            }}>
              <span style={{ fontSize: 22 }}>{(aiReport as any).reliabilityAlert ? '⚠️' : '✅'}</span>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700, fontSize: 11, marginBottom: 5, letterSpacing: '0.07em',
                  color: (aiReport as any).reliabilityAlert ? '#FCA5A5' : '#6EE7B7' }}>
                  1 · THẨM ĐỊNH ĐỘ TIN CẬY
                </div>
                <p style={{ margin: 0, fontSize: 13, lineHeight: 1.7, color: '#E2E8F0' }}>
                  {(aiReport as any).reliabilityVerdict ?? (aiReport as any).executiveSummary}
                </p>
                {(aiReport as any).reliabilityAlert && (
                  <div style={{ marginTop: 8, padding: '6px 12px', background: 'rgba(239,68,68,0.2)',
                    borderRadius: 6, fontSize: 11, fontWeight: 700, color: '#FCA5A5' }}>
                    🚨 Cần kiểm chứng lại qua phỏng vấn trực tiếp
                  </div>
                )}
              </div>
            </div>

            {/* ── 2. Chân dung cốt cách ───────────────────────────── */}
            <div style={{
              background: 'linear-gradient(135deg, rgba(99,102,241,0.15), rgba(139,92,246,0.12))',
              border: '1px solid rgba(99,102,241,0.3)', borderRadius: 12, padding: '18px 20px',
            }}>
              <div style={{ fontWeight: 700, fontSize: 11, color: '#A5B4FC', marginBottom: 10, letterSpacing: '0.07em' }}>
                2 · PHÁC HỌA CHÂN DUNG CỐT CÁCH
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                <span style={{ fontSize: 40 }}>{(aiReport as any).personaEmoji ?? '🧠'}</span>
                <div>
                  <div style={{ fontSize: 20, fontWeight: 900, color: 'white', letterSpacing: '-0.02em' }}>
                    {(aiReport as any).personaTitle}
                  </div>
                  <div style={{ fontSize: 10, color: '#94A3B8', fontWeight: 600 }}>BẢN NGÃ NHÂN SỰ</div>
                </div>
              </div>
              <p style={{ margin: '0 0 10px', fontSize: 13, lineHeight: 1.75, color: '#CBD5E1' }}>
                {(aiReport as any).personaDescription}
              </p>
              {(aiReport as any).personaCombination && (
                <div style={{ padding: '10px 14px', background: 'rgba(255,255,255,0.06)', borderRadius: 8, borderLeft: '3px solid #6366F1' }}>
                  <div style={{ fontSize: 10, fontWeight: 700, color: '#818CF8', marginBottom: 4, letterSpacing: '0.05em' }}>PHÂN TÍCH TỔ HỢP</div>
                  <p style={{ margin: 0, fontSize: 12, lineHeight: 1.65, color: '#94A3B8' }}>
                    {(aiReport as any).personaCombination}
                  </p>
                </div>
              )}
            </div>

            {/* ── 3. Thế mạnh & Điểm mù ──────────────────────────── */}
            {((aiReport as any).strengths || (aiReport as any).blindSpots) && (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.25)', borderRadius: 12, padding: '14px 16px' }}>
                  <div style={{ fontWeight: 700, fontSize: 11, color: '#6EE7B7', marginBottom: 10, letterSpacing: '0.07em' }}>3A · THẾ MẠNH NỔI TRỘI</div>
                  {((aiReport as any).strengths ?? []).map((s: any, i: number) => (
                    <div key={i} style={{ marginBottom: 10, paddingBottom: 10, borderBottom: i < ((aiReport as any).strengths.length - 1) ? '1px solid rgba(16,185,129,0.15)' : 'none' }}>
                      <div style={{ fontWeight: 700, fontSize: 13, color: '#A7F3D0', marginBottom: 3 }}>⚡ {s.title}</div>
                      <p style={{ margin: 0, fontSize: 11, color: '#6EE7B7', lineHeight: 1.55 }}>{s.behavior}</p>
                    </div>
                  ))}
                </div>
                <div style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.22)', borderRadius: 12, padding: '14px 16px' }}>
                  <div style={{ fontWeight: 700, fontSize: 11, color: '#FCA5A5', marginBottom: 10, letterSpacing: '0.07em' }}>3B · ĐIỂM MÙ & RỦI RO</div>
                  {((aiReport as any).blindSpots ?? []).map((b: any, i: number) => (
                    <div key={i} style={{ marginBottom: 10, paddingBottom: 10, borderBottom: i < ((aiReport as any).blindSpots.length - 1) ? '1px solid rgba(239,68,68,0.15)' : 'none' }}>
                      <div style={{ fontWeight: 700, fontSize: 13, color: '#FECACA', marginBottom: 3 }}>🔍 {b.title}</div>
                      <p style={{ margin: 0, fontSize: 11, color: '#FCA5A5', lineHeight: 1.55 }}>{b.risk}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ── 4. Job-Fit Mapping ──────────────────────────────── */}
            {(aiReport as any).jobFit && (
              <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, padding: '16px 20px' }}>
                <div style={{ fontWeight: 700, fontSize: 11, color: '#FCD34D', marginBottom: 14, letterSpacing: '0.07em' }}>
                  4 · ĐÁNH GIÁ ĐỘ PHÙ HỢP CÔNG VIỆC
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  {([
                    { label: '💻 Kỹ Thuật (Dev/R&D)',     block: (aiReport as any).jobFit?.technical },
                    { label: '💰 Kinh Doanh (Sales/CS)',  block: (aiReport as any).jobFit?.business },
                    { label: '📋 Vận Hành (KT/Hành chính)', block: (aiReport as any).jobFit?.operations },
                    { label: '🌟 Quản Lý (Lead/Manager)', block: (aiReport as any).jobFit?.management },
                  ]).map(({ label, block }, i) => {
                    if (!block) return null;
                    const pct = Math.min(100, Math.max(0, block.score ?? 0));
                    const col = pct >= 75 ? '#34D399' : pct >= 55 ? '#60A5FA' : pct >= 40 ? '#FBBF24' : '#F87171';
                    return (
                      <div key={i} style={{ background: 'rgba(0,0,0,0.2)', borderRadius: 10, padding: '12px 14px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, alignItems: 'center' }}>
                          <span style={{ fontSize: 12, fontWeight: 600, color: '#E2E8F0' }}>{label}</span>
                          <span style={{ fontWeight: 900, fontSize: 18, color: col }}>{pct}%</span>
                        </div>
                        <div style={{ height: 6, background: 'rgba(255,255,255,0.1)', borderRadius: 3, marginBottom: 8, overflow: 'hidden' }}>
                          <div style={{ height: '100%', width: `${pct}%`, borderRadius: 3, background: `linear-gradient(90deg, ${col}88, ${col})` }} />
                        </div>
                        <p style={{ margin: 0, fontSize: 11, color: '#94A3B8', lineHeight: 1.5 }}>{block.comment}</p>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* ── 5. Coaching Advice ──────────────────────────────── */}
            {((aiReport as any).coachingAdvice ?? []).length > 0 && (
              <div style={{ background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.25)', borderRadius: 12, padding: '16px 20px' }}>
                <div style={{ fontWeight: 700, fontSize: 11, color: '#A5B4FC', marginBottom: 12, letterSpacing: '0.07em' }}>
                  5 · LỜI KHUYÊN PHÁT TRIỂN (COACHING ADVICE)
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                  {(aiReport as any).coachingAdvice.map((c: any, i: number) => (
                    <div key={i} style={{ padding: '12px 14px', background: 'rgba(0,0,0,0.2)', borderRadius: 10, borderLeft: '3px solid #6366F1' }}>
                      <div style={{ fontWeight: 700, fontSize: 13, color: '#C7D2FE', marginBottom: 6 }}>🚀 {c.action}</div>
                      <p style={{ margin: 0, fontSize: 11, color: '#94A3B8', lineHeight: 1.55 }}>{c.rationale}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>
        ) : aiReport ? (
          /* Fallback: hiển thị format cũ nếu dữ liệu chưa được cập nhật */
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {(aiReport as any).executiveSummary && (
              <div style={{ background: 'rgba(255,255,255,0.06)', borderRadius: 12, padding: '14px 18px' }}>
                <p style={{ margin: 0, fontSize: 13, lineHeight: 1.75, color: '#CBD5E1' }}>{(aiReport as any).executiveSummary}</p>
              </div>
            )}
            {(aiReport as any).strengthsNarrative && (
              <div style={{ background: 'rgba(16,185,129,0.1)', borderRadius: 10, padding: '12px 14px' }}>
                <div style={{ fontWeight: 700, fontSize: 11, color: '#6EE7B7', marginBottom: 6 }}>💪 Thế mạnh</div>
                <p style={{ margin: 0, fontSize: 12, color: '#A7F3D0', lineHeight: 1.6 }}>{(aiReport as any).strengthsNarrative}</p>
              </div>
            )}
            {(aiReport as any).hrRecommendation && (
              <div style={{ background: 'rgba(245,158,11,0.1)', borderRadius: 10, padding: '12px 14px' }}>
                <div style={{ fontWeight: 700, fontSize: 11, color: '#FCD34D', marginBottom: 6 }}>📋 Khuyến nghị HR</div>
                <p style={{ margin: 0, fontSize: 12, color: '#FDE68A', lineHeight: 1.6 }}>{(aiReport as any).hrRecommendation}</p>
              </div>
            )}
            <div style={{ textAlign: 'center', padding: '8px 0', fontSize: 11, color: '#475569' }}>
              ⚠️ Báo cáo này dùng format cũ. Làm mới để nhận phân tích AI mới nhất.
            </div>
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '32px 0' }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>🔮</div>
            <p style={{ margin: 0, fontSize: 14, color: '#64748B' }}>Hệ thống AI đang phân tích dữ liệu nhân sự...</p>
            <p style={{ margin: '6px 0 0', fontSize: 11, color: '#475569' }}>Quá trình này mất khoảng 10–20 giây</p>
          </div>
        )}
      </div>
    </div>
  );
}


