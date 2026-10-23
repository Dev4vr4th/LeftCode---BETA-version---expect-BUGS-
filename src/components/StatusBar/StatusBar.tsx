import { useApp } from '../../store/AppContext';
import './StatusBar.css';

export function StatusBar() {
  const { settings, openTabs, activeTabId } = useApp();

  const activeTab = openTabs.find((t) => t.id === activeTabId);
  const modeLabel =
    settings.layoutMode === 'oneHand'
      ? 'ONE-HAND'
      : settings.layoutMode === 'rightHand'
      ? 'RIGHT-HAND'
      : 'NORMAL';

  // Simple heuristic for "hand travel score"
  // Lower is better. One-hand mode + left explorer + radial = lowest travel.
  let travelScore = 70;
  if (settings.layoutMode === 'oneHand') travelScore -= 35;
  if (settings.explorerSide === 'left') travelScore -= 15;
  if (settings.showExplorer) travelScore -= 5;
  travelScore = Math.max(5, Math.min(100, travelScore));

  const travelLabel =
    travelScore <= 25 ? 'Minimal' : travelScore <= 45 ? 'Low' : travelScore <= 65 ? 'Medium' : 'High';

  const travelColor =
    travelScore <= 25 ? '#3fb950' : travelScore <= 45 ? '#58a6ff' : travelScore <= 65 ? '#d29922' : '#f85149';

  return (
    <footer className="status-bar">
      <div className="status-left">
        <span className="status-item mode">{modeLabel}</span>
        {settings.mirrorMode && <span className="status-item mode">MIRROR</span>}
        {activeTab && (
          <span className="status-item">
            {activeTab.language?.toUpperCase() || 'TEXT'} · {activeTab.name}
            {activeTab.isDirty ? ' · modified' : ''}
          </span>
        )}
      </div>

      <div className="status-right">
        <span className="status-item travel" title="Estimated hand travel for common actions">
          Hand travel:{' '}
          <strong style={{ color: travelColor }}>{travelLabel}</strong>
          <span className="travel-bar">
            <span
              className="travel-fill"
              style={{ width: `${100 - travelScore}%`, background: travelColor }}
            />
          </span>
        </span>
        <span className="status-item">LeftCode v0.3</span>
      </div>
    </footer>
  );
}
