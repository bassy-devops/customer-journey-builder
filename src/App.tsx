import { Sidebar } from './components/Sidebar';
import { FlowEditor } from './components/FlowEditor';
import { PropertiesPanel } from './components/PropertiesPanel';
import { SimulationBar } from './components/SimulationBar';
import { FlowActions } from './components/FlowActions';
import styles from './App.module.css';

function App() {
  return (
    <div className={styles.app}>
      <header className={styles.header}>
        <h1 className={styles.title}>Customer Journey Builder</h1>
        <FlowActions />
      </header>
      <main className={styles.main}>
        <Sidebar />
        <div style={{ position: 'relative', flex: 1, display: 'flex', flexDirection: 'column' }}>
          <FlowEditor />
          <SimulationBar />
        </div>
        <PropertiesPanel />
      </main>
    </div>
  );
}

export default App;
