import { Sidebar } from './components/Sidebar';
import { FlowEditor } from './components/FlowEditor';
import { PropertiesPanel } from './components/PropertiesPanel';
import { SimulationBar } from './components/SimulationBar';
import { FlowActions } from './components/FlowActions';
import { useSimulationStore } from './store/useSimulationStore';
import styles from './App.module.css';

function App() {
  const { isDryRunMode } = useSimulationStore();

  return (
    <div className={styles.app}>
      <header className={styles.header}>
        <h1 className={styles.title}>Customer Journey Builder {isDryRunMode && <span style={{ color: '#10b981', marginLeft: '10px', fontSize: '0.8em', background: '#ecfdf5', padding: '2px 8px', borderRadius: '4px' }}>DRY RUN MODE</span>}</h1>
        <FlowActions />
      </header>
      <main className={styles.main}>
        <Sidebar />
        <div style={{ position: 'relative', flex: 1, display: 'flex', flexDirection: 'column' }}>
          <FlowEditor />
          {isDryRunMode && <SimulationBar />}
        </div>
        <PropertiesPanel />
      </main>
    </div>
  );
}

export default App;
