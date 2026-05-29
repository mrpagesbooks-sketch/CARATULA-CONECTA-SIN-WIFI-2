import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Home, 
  Calendar, 
  Activity, 
  ShieldCheck, 
  ShieldAlert,
  Star,
  Printer, 
  CheckCircle2, 
  AlertTriangle,
  Heart,
  Trophy,
  ExternalLink,
  ChevronRight,
  Music,
  CameraOff,
  Users,
  Utensils,
  Bell,
  Download,
  Trash2,
  Search,
  ChevronLeft
} from 'lucide-react';

type Tab = 'inicio' | 'reto' | 'actividades' | 'control' | 'imprimibles' | 'alarma';

const TASKS: Record<number, { title: string; desc: string; icon: React.ReactNode }> = {
  1: { title: "Cena Sin Dispositivos", desc: "Conversación real durante toda la cena. Prohibido móviles en la mesa.", icon: <Utensils className="w-5 h-5" /> },
  2: { title: "Zona Libre de Pantallas", desc: "Designar una habitación (ej. el salón) como zona 100% analógica hoy.", icon: <ShieldCheck className="w-5 h-5" /> },
  3: { title: "Lectura en Familia", desc: "Leer un cuento o libro juntos durante 20 minutos antes de dormir.", icon: <Activity className="w-5 h-5" /> },
  4: { title: "Mañanas con Sonido", desc: "Sustituir dibujos por música o un podcast infantil mientras se desayuna.", icon: <Music className="w-5 h-5" /> },
  5: { title: "Juego de Mesa", desc: "Rescatar un juego de mesa clásico y jugar una partida completa.", icon: <Users className="w-5 h-5" /> },
  6: { title: "Cocina Creativa", desc: "Preparar una merienda saludable juntos sin mirar tutoriales en vídeo.", icon: <Utensils className="w-5 h-5" /> },
  7: { title: "El Paseo Analógico", desc: "Caminata por el parque sin sacar fotos ni mirar el móvil.", icon: <CameraOff className="w-5 h-5" /> },
  8: { title: "Tarde de Manualidades", desc: "Usar pintura, plastilina o arcilla para crear algo con las manos.", icon: <Activity className="w-5 h-5" /> },
  9: { title: "Correspondencia Real", desc: "Escribir una carta o hacer un dibujo para un abuelo o familiar y enviarla por correo.", icon: <Users className="w-5 h-5" /> },
  10: { title: "Limpieza Digital", desc: "Revisar juntos las apps instaladas y borrar las que no aportan valor.", icon: <ShieldCheck className="w-5 h-5" /> },
  11: { title: "Picnic en el Salón", desc: "Cenar en el suelo sobre una manta, como si estuviéramos en el campo.", icon: <Utensils className="w-5 h-5" /> },
  12: { title: "Sesión de Retratos", desc: "Dibujarse unos a otros en papel. ¡No valen las selfies!", icon: <Users className="w-5 h-5" /> },
  13: { title: "El Club del Chiste", desc: "Sesión de chistes y adivinanzas. Risas garantizadas sin pantallas.", icon: <Activity className="w-5 h-5" /> },
  14: { title: "Búsqueda del Tesoro", desc: "Esconder pistas por casa para encontrar un pequeño premio físico.", icon: <Activity className="w-5 h-5" /> },
  15: { title: "Origami y Papel", desc: "Hacer aviones, barcos o animales doblando papel.", icon: <Activity className="w-5 h-5" /> },
  16: { title: "Pequeño Jardinero", desc: "Plantar una semilla o cuidar las plantas que ya tenemos en casa.", icon: <Activity className="w-5 h-5" /> },
  17: { title: "Construcción con Reciclaje", desc: "Usar cajas de cartón y envases para construir un cohete o un castillo.", icon: <Activity className="w-5 h-5" /> },
  18: { title: "Noche de Estrellas", desc: "Si es posible, mirar el cielo nocturno e intentar identificar constelaciones.", icon: <CameraOff className="w-5 h-5" /> },
  19: { title: "Inventar un Cuento", desc: "Crear una historia entre todos: uno empieza y el siguiente continúa.", icon: <Users className="w-5 h-5" /> },
  20: { title: "Preparar la Fiesta", desc: "Hacer decoraciones de papel para la gran fiesta de mañana.", icon: <Activity className="w-5 h-5" /> },
  21: { title: "La Fiesta de la Desconexión", desc: "Celebración familiar por haber completado el reto. ¡Diploma incluido!", icon: <Trophy className="w-5 h-5" /> }
};

export default function App() {
  const [activeTab, setActiveTab] = useState<Tab>('inicio');
  const [testResult, setTestResult] = useState<string | null>(null);
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [completedDays, setCompletedDays] = useState<number[]>(() => {
    const saved = localStorage.getItem('completedDays');
    return saved ? JSON.parse(saved) : [];
  });
  const [printingItem, setPrintingItem] = useState<'pacto' | 'diploma' | 'cuponera' | 'progreso' | null>(null);
  const [previewItem, setPreviewItem] = useState<'pacto' | 'diploma' | 'cuponera' | 'progreso' | null>(null);
  const [activatedActivities, setActivatedActivities] = useState<string[]>(() => {
    const saved = localStorage.getItem('activatedActivities');
    return saved ? JSON.parse(saved) : [];
  });
  const [alarmTime, setAlarmTime] = useState<string>(() => localStorage.getItem('alarmTime') || '18:00');
  const [alarmEnabled, setAlarmEnabled] = useState<boolean>(() => localStorage.getItem('alarmEnabled') === 'true');
  const [alarmTriggered, setAlarmTriggered] = useState(false);

  useEffect(() => {
    const checkAlarm = () => {
      if (!alarmEnabled || alarmTriggered) return;

      const now = new Date();
      const current = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

      if (current === alarmTime) {
        setAlarmTriggered(true);
        playAlarm();
        
        if ("Notification" in window && Notification.permission === "granted") {
          new Notification("¡Hora de Reconectar!", {
            body: "Es momento de hacer la actividad familiar sin pantallas.",
            icon: "/favicon.ico"
          });
        } else {
          alert("¡HORA DE RECONECTAR! Es momento de tu actividad familiar.");
        }

        // Reset alarm after 1 minute so it doesn't trigger again immediately if turned off/on
        setTimeout(() => setAlarmTriggered(false), 61000);
      }
    };

    const playAlarm = () => {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioCtx.destination);

      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(440, audioCtx.currentTime); // A4
      
      // Beep-beep pattern
      gainNode.gain.setValueAtTime(0, audioCtx.currentTime);
      gainNode.gain.linearRampToValueAtTime(0.5, audioCtx.currentTime + 0.1);
      gainNode.gain.linearRampToValueAtTime(0, audioCtx.currentTime + 0.5);
      gainNode.gain.linearRampToValueAtTime(0.5, audioCtx.currentTime + 0.6);
      gainNode.gain.linearRampToValueAtTime(0, audioCtx.currentTime + 1.0);

      oscillator.start();
      oscillator.stop(audioCtx.currentTime + 1.5);
    };

    const interval = setInterval(checkAlarm, 30000); // Check every 30 seconds
    return () => clearInterval(interval);
  }, [alarmEnabled, alarmTime, alarmTriggered]);

  useEffect(() => {
    localStorage.setItem('completedDays', JSON.stringify(completedDays));
  }, [completedDays]);

  useEffect(() => {
    localStorage.setItem('activatedActivities', JSON.stringify(activatedActivities));
  }, [activatedActivities]);

  useEffect(() => {
    localStorage.setItem('alarmTime', alarmTime);
    localStorage.setItem('alarmEnabled', String(alarmEnabled));
    
    if (alarmEnabled && "Notification" in window) {
      if (Notification.permission !== "granted") {
        Notification.requestPermission();
      }
    }
  }, [alarmTime, alarmEnabled]);

  const getBackgroundImage = () => {
    switch (activeTab) {
      case 'inicio':
        return "url('/1.jpg')";
      case 'reto':
        return "url('/input_file_1.png')";
      case 'actividades':
        return "url('/input_file_2.png')";
      case 'control':
        return "url('/input_file_0.png')";
      case 'alarma':
        return "url('/input_file_1.png')";
      default:
        return "url('/input_file_3.png')";
    }
  };

  const getTabColor = (tab: Tab) => {
    switch (tab) {
      case 'inicio': return '#6366f1';
      case 'reto': return '#8b5cf6';
      case 'actividades': return '#10b981';
      case 'control': return '#f43f5e';
      case 'imprimibles': return '#f59e0b';
      case 'alarma': return '#4f46e5';
      default: return '#6366f1';
    }
  };

  const handleTest = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const checks = Array.from(formData.keys()).length;
    
    if (checks <= 2) {
      setTestResult("Resultado: Riesgo Leve. Es el momento perfecto para prevenir y establecer hábitos saludables.");
    } else {
      setTestResult("Resultado: Dependencia Activa. Implementa el plan de 21 días con urgencia para recuperar el equilibrio.");
    }
  };

  const toggleDay = (day: number) => {
    if (completedDays.includes(day)) {
      setCompletedDays(completedDays.filter(d => d !== day));
    } else {
      setCompletedDays([...completedDays, day]);
    }
  };

  const toggleActivity = (activity: string) => {
    if (activatedActivities.includes(activity)) {
      setActivatedActivities(activatedActivities.filter(a => a !== activity));
    } else {
      setActivatedActivities([...activatedActivities, activity]);
    }
  };

  const handlePrint = (item: 'pacto' | 'diploma' | 'cuponera' | 'progreso') => {
    console.log('Attempting to print:', item);
    setPrintingItem(item);
    
    // Give state time to update and ensure the DOM is ready for print
    setTimeout(() => {
      try {
        window.focus();
        window.print();
      } catch (err) {
        console.error('Print failed:', err);
        alert('Hubo un problema al abrir el diálogo de impresión. Intenta abrir la app en una nueva pestaña.');
      }
      // We don't clear immediately to allow the print dialog to capture the state
      setTimeout(() => setPrintingItem(null), 500);
    }, 500);
  };

  const downloadProgress = () => {
    const data = {
      user: "Héroe del Mundo Real",
      días_completados: completedDays.sort((a, b) => a - b),
      total_completados: completedDays.length,
      actividades_favoritas: activatedActivities,
      fecha: new Date().toLocaleDateString()
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `progreso-sos-ninos-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const progressCount = completedDays.length;
  const progressPercent = (progressCount / 21) * 100;

  const renderPacto = () => (
    <div className="border-8 border-blue-900 p-8 md:p-12 rounded-[2rem] md:rounded-[3rem] bg-white text-slate-800">
      <div className="text-center mb-8 md:mb-12">
        <h1 className="text-3xl md:text-5xl font-black uppercase mb-4 text-blue-900 leading-tight">Nuestro Pacto Familiar Digital</h1>
        <p className="text-lg md:text-2xl font-serif italic text-slate-600">"Porque nos amamos, elegimos estar presentes"</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 text-base md:text-xl">
        {[
          { id: 1, title: "Espacios Sagrados", desc: "Nos comprometemos a no usar pantallas en la mesa, en los dormitorios ni en el baño." },
          { id: 2, title: "Horario de Desconexión", desc: "Acordamos una hora de apagado total de dispositivos 1 hora antes de dormir." },
          { id: 3, title: "Regla de Oro", desc: "El que avisa no traiciona: daremos un aviso 5 minutos antes de terminar el tiempo de pantalla." },
          { id: 4, title: "Efecto Espejo", desc: "Los adultos daremos ejemplo cumpliendo las mismas zonas libres de pantallas." }
        ].map((item) => (
          <div key={item.id} className="flex items-start space-x-4 md:space-x-6 bg-slate-50 p-4 md:p-6 rounded-2xl border border-slate-100">
            <div className="bg-blue-900 text-white w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center font-bold shrink-0 shadow-lg">
              {item.id}
            </div>
            <div>
              <h3 className="font-bold text-xl md:text-2xl mb-2 text-blue-800">{item.title}</h3>
              <p className="text-slate-600 leading-relaxed font-medium">{item.desc}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-16 md:mt-24 grid grid-cols-2 gap-8 md:px-12">
        <div className="border-t-2 border-slate-900 text-center pt-4">
          <p className="font-bold text-sm md:text-xl uppercase tracking-widest text-slate-700">Firma Papá/Mamá</p>
        </div>
        <div className="border-t-2 border-slate-900 text-center pt-4">
          <p className="font-bold text-sm md:text-xl uppercase tracking-widest text-slate-700">Firma Hijo/a</p>
        </div>
      </div>
    </div>
  );

  const renderDiploma = () => (
    <div className="border-[12px] md:border-[20px] border-amber-400 p-8 md:p-16 text-center rounded-[2.5rem] md:rounded-[5rem] relative bg-white text-slate-800 shadow-inner">
      <div className="absolute top-4 left-4 md:top-10 md:left-10 text-4xl md:text-7xl opacity-10 rotate-[-15deg]">⭐</div>
      <div className="absolute top-4 right-4 md:top-10 md:right-10 text-4xl md:text-7xl opacity-10 rotate-[15deg]">🌟</div>
      <div className="absolute bottom-4 left-4 md:bottom-10 md:left-10 text-4xl md:text-7xl opacity-10 rotate-[45deg]">⭐</div>
      <div className="absolute bottom-4 right-4 md:bottom-10 md:right-10 text-4xl md:text-7xl opacity-10 rotate-[-45deg]">🌟</div>
      
      <div className="bg-amber-50 rounded-full w-24 h-24 md:w-32 md:h-32 mx-auto mb-6 flex items-center justify-center text-5xl md:text-7xl border-4 border-amber-400">
        🏆
      </div>
      
      <h1 className="text-5xl md:text-8xl font-black text-amber-600 mb-4 tracking-tighter drop-shadow-sm">DIPLOMA</h1>
      <h2 className="text-xl md:text-4xl font-bold text-slate-700 tracking-[0.2em] mb-8 md:mb-16 uppercase">Al Héroe del Mundo Real</h2>
      
      <p className="text-xl md:text-3xl mb-6 md:mb-10 font-medium text-slate-500">Se otorga con orgullo este reconocimiento a:</p>
      <div className="border-b-4 border-dotted border-amber-300 w-11/12 md:w-3/4 mx-auto mb-10 md:mb-16 h-12 md:h-16"></div>
      
      <p className="text-lg md:text-2xl italic text-slate-600 max-w-2xl mx-auto leading-relaxed font-serif bg-amber-50/50 p-6 rounded-3xl">
        "Por su valentía al elegir más juegos, más risas y conquistar el equilibrio digital, demostrando que la vida real es la mejor aventura."
      </p>
      
      <div className="mt-12 md:mt-20 flex justify-center items-center space-x-12">
        <div className="text-amber-400 font-bold tracking-[0.3em] uppercase text-xs md:text-base border-t border-amber-100 pt-2">
          FECHA: {new Date().toLocaleDateString('es-ES')}
        </div>
        <div className="bg-amber-500 text-white p-3 rounded-full shadow-lg border-4 border-white transform rotate-12">
          OFICIAL
        </div>
      </div>
    </div>
  );

  const renderCuponera = () => (
    <div className="p-4 md:p-8 bg-white text-slate-800">
      <div className="text-center mb-8 md:mb-12">
        <h1 className="text-3xl md:text-5xl font-black text-blue-900 uppercase mb-2 tracking-tight">Cuponera Analógica</h1>
        <p className="text-sm md:text-xl text-slate-500 italic font-serif">"Cambiamos tiempo de pantalla por momentos de calidad"</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
        {[
          { text: "1 tarde de parque extra", icon: "🌳" },
          { text: "Elegir la cena de hoy", icon: "🍕" },
          { text: "1 partida de juego de mesa", icon: "🎲" },
          { text: "Sesión de lectura extra", icon: "📚" },
          { text: "Tarde de cocina juntos", icon: "🍰" },
          { text: "Excursión sorpresa", icon: "🎒" }
        ].map((item, i) => (
          <div key={i} className="border-4 border-dashed border-blue-200 p-6 md:p-8 rounded-[2rem] relative bg-slate-50 transition hover:bg-white hover:shadow-xl group overflow-hidden">
            <div className="absolute -right-4 -top-4 w-20 h-20 bg-blue-100 rounded-full opacity-50 transition group-hover:scale-150"></div>
            <div className="text-4xl md:text-5xl mb-4 relative z-10">{item.icon}</div>
            <h3 className="text-xl md:text-3xl font-black text-slate-800 mb-2 leading-tight relative z-10 uppercase">{item.text}</h3>
            <p className="text-slate-500 text-xs md:text-base italic border-t-2 border-blue-100 pt-4 mt-4 font-medium">Canjeable por 1 día de éxito en el reto.</p>
            <div className="absolute bottom-4 right-6 text-blue-200 font-black text-4xl md:text-6xl select-none opacity-40">#0{i+1}</div>
          </div>
        ))}
      </div>
      <div className="mt-12 text-center text-slate-300 text-xs md:text-sm font-black uppercase tracking-[0.25em]">
        ••••• Cortar por la línea de puntos • SOS Niños Sin Pantallas •••••
      </div>
    </div>
  );

  const renderProgreso = () => (
    <div className="border-8 border-emerald-600 p-8 md:p-12 rounded-[2rem] md:rounded-[3rem] bg-white text-emerald-900 shadow-2xl">
      <div className="bg-emerald-600 text-white p-6 rounded-2xl mb-8 flex justify-between items-center">
        <h1 className="text-2xl md:text-4xl font-black uppercase tracking-tighter">Reporte de Superación</h1>
        <div className="bg-white text-emerald-600 rounded-full p-2">🌟</div>
      </div>
      
      <div className="grid md:grid-cols-3 gap-6 mb-10">
        <div className="bg-emerald-50 p-6 rounded-2xl border-2 border-emerald-100 text-center">
          <p className="text-sm font-black uppercase text-emerald-600 mb-1">Días Logrados</p>
          <p className="text-4xl md:text-6xl font-black">{completedDays.length}</p>
        </div>
        <div className="bg-emerald-50 p-6 rounded-2xl border-2 border-emerald-100 text-center">
          <p className="text-sm font-black uppercase text-emerald-600 mb-1">Días Restantes</p>
          <p className="text-4xl md:text-6xl font-black">{21 - completedDays.length}</p>
        </div>
        <div className="bg-emerald-50 p-6 rounded-2xl border-2 border-emerald-100 text-center">
          <p className="text-sm font-black uppercase text-emerald-600 mb-1">Efectividad</p>
          <p className="text-4xl md:text-6xl font-black">{Math.round((completedDays.length / 21) * 100)}%</p>
        </div>
      </div>

      <div className="bg-white p-6 rounded-3xl border-4 border-slate-100 mb-10">
        <h2 className="text-xl md:text-2xl font-black mb-6 border-b-4 border-emerald-100 pb-2 flex items-center">
          <Calendar className="w-6 h-6 mr-3 text-emerald-500" />
          Calendario del Reto
        </h2>
        <div className="grid grid-cols-7 gap-2 md:gap-4">
          {Array.from({ length: 21 }, (_, i) => i + 1).map(d => (
            <div key={d} className={`h-10 md:h-16 flex items-center justify-center border-4 rounded-xl md:rounded-2xl font-black transition-all ${completedDays.includes(d) ? 'bg-emerald-500 text-white border-emerald-300 scale-105 shadow-md' : 'bg-slate-50 border-slate-200 text-slate-300 text-xs'}`}>
              {d}
            </div>
          ))}
        </div>
      </div>

      <div className="bg-slate-50 p-8 rounded-3xl border-4 border-white shadow-lg">
        <h3 className="text-xl md:text-2xl font-black border-b-4 border-emerald-100 pb-4 mb-6 flex items-center text-slate-800">
          <Activity className="w-6 h-6 mr-3 text-emerald-500" />
          Nuestras Actividades Favoritas
        </h3>
        <ul className="grid grid-cols-1 md:grid-cols-2 gap-4 text-slate-700">
          {activatedActivities.length > 0 ? activatedActivities.map((a, i) => (
            <li key={i} className="flex items-center space-x-3 bg-white p-3 rounded-xl border border-slate-200 font-bold shadow-sm">
              <span className="text-emerald-500">⚡</span>
              <span>{a}</span>
            </li>
          )) : <li className="text-slate-400 italic font-medium">Aún no has seleccionado tus actividades favoritas.</li>}
        </ul>
      </div>

      <div className="mt-12 pt-8 border-t-2 border-emerald-100 text-center">
        <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">Generado por SOS Niños Sin Pantallas • {new Date().toLocaleDateString()}</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen font-sans text-slate-800 relative bg-[#0f172a]">
      {/* Background Image Overlay */}
      <motion.div 
        key={activeTab}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
        className="fixed inset-0 z-[-1] bg-cover bg-center bg-no-repeat print:hidden"
        style={{ 
          backgroundImage: `linear-gradient(rgba(15, 23, 42, ${activeTab === 'inicio' ? '0.3' : '0.85'}), rgba(15, 23, 42, ${activeTab === 'inicio' ? '0.3' : '0.85'})), ${getBackgroundImage()}`,
        }}
      />
      
      {/* Branding Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/10 backdrop-blur-3xl border-b border-white/10 px-6 py-4 print:hidden">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl overflow-hidden shadow-lg border border-white/20 flex items-center justify-center shrink-0">
              <img 
                src="/1.jpg" 
                alt="S.O.S. Niños" 
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
            <span className="agency-heading text-white text-base md:text-xl font-black tracking-wider uppercase">S.O.S. NIÑOS SIN PANTALLAS</span>
          </div>
          
          <div className="flex items-center space-x-1 lg:space-x-2">
            {[
              { id: 'inicio', label: 'Inicio', icon: <Home className="w-4 h-4" /> },
              { id: 'reto', label: 'Reto 21', icon: <Calendar className="w-4 h-4" /> },
              { id: 'actividades', label: 'Actividades', icon: <Activity className="w-4 h-4" /> },
              { id: 'control', label: 'Control', icon: <ShieldCheck className="w-4 h-4" /> },
              { id: 'imprimibles', label: 'Print', icon: <Printer className="w-4 h-4" /> },
              { id: 'alarma', label: 'Alarma', icon: <Bell className="w-4 h-4" /> },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as Tab)}
                className={`agency-btn py-2 px-4 text-sm ${
                  activeTab === tab.id 
                    ? 'bg-white text-slate-900 shadow-mega scale-105' 
                    : 'text-white/70 hover:text-white hover:bg-white/10'
                } hidden md:flex`}
              >
                {tab.icon}
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
          
          <div className="flex md:hidden items-center">
            <div className={`p-2 rounded-lg bg-white/20 text-white text-xs font-black uppercase tracking-tighter`}>
               {activeTab}
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="pt-24 md:pt-28 pb-32 max-w-5xl mx-auto px-4 md:px-6 print:hidden">
        <AnimatePresence mode="wait">
          {activeTab === 'inicio' && (
            <motion.section
              key="inicio"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-8"
            >
              {/* Hero Section Refined */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center py-10 md:py-20 relative">
                <div className="lg:col-span-7 text-left space-y-6 relative z-10">
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                  >
                    <span className="bg-brand-indigo/20 text-brand-indigo px-4 py-2 rounded-full text-xs font-black uppercase tracking-widest">Iniciativa SOS Niños</span>
                    <h1 className="agency-heading text-5xl md:text-8xl font-black uppercase mt-6 text-white leading-none drop-shadow-mega">
                      Reto <span className="text-brand-amber">21 días</span>
                    </h1>
                    <p className="mt-6 text-xl md:text-2xl font-medium text-white/80 max-w-xl text-balance leading-tight">
                      Transforma la relación de tu familia con las pantallas y recupera lo esencial.
                    </p>

                    <div className="flex flex-wrap gap-4 mt-10">
                      <button onClick={() => setActiveTab('reto')} className="agency-btn bg-brand-indigo text-white shadow-premium hover:shadow-mega hover:-translate-y-1">
                        Comenzar Reto
                      </button>
                      <button onClick={() => setActiveTab('actividades')} className="agency-btn bg-white/10 text-white backdrop-blur-md border border-white/20 hover:bg-white/20">
                        Ver Actividades
                      </button>
                    </div>
                  </motion.div>
                </div>

                <div className="lg:col-span-5 relative">
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.2 }}
                    className="rounded-agency overflow-hidden shadow-mega border-4 md:border-8 border-white/10 relative group bg-slate-950"
                  >
                    <img 
                      src="/1.jpg" 
                      alt="Momento familiar" 
                      className="w-full h-auto object-cover block group-hover:scale-105 transition-all duration-700"
                      referrerPolicy="no-referrer"
                    />
                    
                    {/* Gradient overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 to-transparent transition-all duration-500"></div>
                  </motion.div>
                </div>
              </div>

              {/* Status & Quick Stats */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="glass-surface p-8 rounded-agency border-none shadow-premium bg-white/95 flex items-center space-x-6">
                  <div className="w-14 h-14 bg-brand-emerald/10 rounded-2xl flex items-center justify-center text-brand-emerald">
                    <Trophy className="w-8 h-8" />
                  </div>
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Progreso</p>
                    <p className="text-2xl font-black text-slate-900">{progressCount} / 21 Días</p>
                  </div>
                </div>
                <div className="glass-surface p-8 rounded-agency border-none shadow-premium bg-white/95 flex items-center space-x-6">
                  <div className="w-14 h-14 bg-brand-indigo/10 rounded-2xl flex items-center justify-center text-brand-indigo">
                    <Activity className="w-8 h-8" />
                  </div>
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Activas</p>
                    <p className="text-2xl font-black text-slate-900">{activatedActivities.length} Juegos</p>
                  </div>
                </div>
                <div className="glass-surface p-8 rounded-agency border-none shadow-premium bg-white text-slate-900 flex items-center space-x-6">
                  <div className="w-14 h-14 bg-brand-rose/10 rounded-2xl flex items-center justify-center text-brand-rose">
                    <Heart className="w-8 h-8" />
                  </div>
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Compromiso</p>
                    <p className="text-2xl font-black text-slate-900">Nivel Máximo</p>
                  </div>
                </div>
              </div>

                {/* Philosophy Section to fill space */}
                <div className="glass-surface p-10 md:p-16 rounded-agency flex flex-col md:flex-row items-center gap-10 md:gap-16 border-none shadow-mega bg-slate-900 text-white relative overflow-hidden group">
                  <div className="absolute top-0 right-0 w-96 h-96 bg-brand-indigo/10 rounded-full blur-[120px] transition-transform duration-1000 group-hover:scale-125"></div>
                  <div className="md:w-1/2 space-y-6 relative z-10">
                    <h2 className="agency-heading text-4xl md:text-6xl font-black uppercase leading-none">Nuestra <span className="text-brand-rose">Filosofía</span></h2>
                    <p className="text-lg md:text-xl text-slate-300 font-medium leading-relaxed">
                      No se trata de prohibir, sino de <span className="text-white font-bold">priorizar la vida real</span>. 
                      Buscamos que la tecnología sea una herramienta y no el destino final de la atención de nuestros hijos.
                    </p>
                    <div className="flex items-center space-x-4 pt-4">
                      <div className="px-5 py-2 bg-white/10 rounded-full border border-white/20 text-xs font-black uppercase tracking-widest">Presencia</div>
                      <div className="px-5 py-2 bg-white/10 rounded-full border border-white/20 text-xs font-black uppercase tracking-widest">Ejemplo</div>
                      <div className="px-5 py-2 bg-white/10 rounded-full border border-white/20 text-xs font-black uppercase tracking-widest">Balance</div>
                    </div>
                  </div>
                  <div className="md:w-1/2 grid grid-cols-2 gap-4 relative z-10 w-full">
                    <div className="p-6 bg-white/5 backdrop-blur-md rounded-agency-sm border border-white/10 text-center space-y-3">
                      <p className="text-3xl">🧩</p>
                      <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Desarrollo</p>
                      <p className="font-bold text-sm">Cerebro Creativo</p>
                    </div>
                    <div className="p-6 bg-white/5 backdrop-blur-md rounded-agency-sm border border-white/10 text-center space-y-3">
                      <p className="text-3xl">💤</p>
                      <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Salud</p>
                      <p className="font-bold text-sm">Sueño Reparador</p>
                    </div>
                    <div className="p-6 bg-white/5 backdrop-blur-md rounded-agency-sm border border-white/10 text-center space-y-3">
                      <p className="text-3xl">🗣️</p>
                      <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Social</p>
                      <p className="font-bold text-sm">Vínculos Reales</p>
                    </div>
                    <div className="p-6 bg-white/5 backdrop-blur-md rounded-agency-sm border border-white/10 text-center space-y-3">
                      <p className="text-3xl">🏃</p>
                      <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Vitalidad</p>
                      <p className="font-bold text-sm">Movimiento Diario</p>
                    </div>
                  </div>
                </div>

                <div className="glass-surface p-6 md:p-14 rounded-agency overflow-hidden relative group">
                <div className="absolute top-0 right-0 w-64 h-64 bg-brand-amber/10 rounded-full blur-3xl -mr-32 -mt-32 transition-transform group-hover:scale-110"></div>
                
                <div className="flex items-center space-x-4 mb-8 md:mb-10">
                  <div className="w-12 h-12 md:w-14 md:h-14 bg-brand-amber/10 rounded-2xl flex items-center justify-center shrink-0">
                    <AlertTriangle className="text-brand-amber w-6 h-6 md:w-8 md:h-8" />
                  </div>
                  <h2 className="agency-heading text-2xl md:text-4xl font-black text-slate-900 leading-tight">¿En qué nivel estamos?</h2>
                </div>
                
                <p className="text-slate-500 text-base md:text-lg mb-8 md:mb-10 max-w-xl text-balance">Realiza este breve test para evaluar la relación de tus hijos con la tecnología de manera honesta.</p>
                
                <form onSubmit={handleTest} className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
                  {[
                    "¿Necesita pantalla para comer o tranquilidad?",
                    "¿Irritabilidad si no tiene el dispositivo?",
                    "¿Pérdida de interés en juegos físicos?",
                    "¿Miente sobre el tiempo de pantalla?",
                    "¿Conversaciones solo sobre internet?",
                    "¿Prefiere casa que salir con amigos?"
                  ].map((q, i) => (
                    <label key={i} className="flex items-center space-x-3 md:space-x-4 p-4 md:p-5 rounded-agency-sm bg-slate-50/50 border border-slate-100 hover:border-brand-indigo/30 hover:bg-white transition-all cursor-pointer group shadow-sm hover:shadow-premium">
                      <input type="checkbox" name={`q${i}`} className="w-5 h-5 md:w-6 md:h-6 rounded-lg border-slate-300 text-brand-indigo focus:ring-brand-indigo transition-all transform group-hover:scale-110" />
                      <span className="text-slate-700 font-semibold text-sm md:text-base leading-tight">{q}</span>
                    </label>
                  ))}
                  
                  <button type="submit" className="md:col-span-2 agency-btn h-14 md:h-16 mt-4 md:mt-6 bg-brand-indigo hover:bg-brand-violet text-white text-lg md:text-xl shadow-lg hover:shadow-mega">
                    Ver Diagnóstico Familiar
                  </button>
                </form>

                {testResult && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`mt-8 p-6 rounded-xl border-2 ${
                      testResult.includes('Leve') 
                        ? 'bg-emerald-50 border-emerald-200 text-emerald-800' 
                        : 'bg-rose-50 border-rose-200 text-rose-800'
                    }`}
                  >
                    <div className="flex items-center space-x-3 mb-2">
                      <CheckCircle2 className="w-5 h-5" />
                      <span className="font-bold text-lg">Resultado del Test</span>
                    </div>
                    <p className="font-medium leading-relaxed">{testResult}</p>
                  </motion.div>
                )}
              </div>

              {/* Added info grid to fill the layout gaps */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-12 pb-12">
                {[
                  { icon: <Activity className="w-6 h-6" />, title: "Ritmo Bio", text: "Regula el uso de pantallas.", color: "text-brand-indigo", bg: "bg-indigo-50" },
                  { icon: <ShieldCheck className="w-6 h-6" />, title: "Zonas Zen", text: "Espacios sagrados en casa sin tecnología.", color: "text-brand-rose", bg: "bg-rose-50" },
                  { icon: <Star className="w-6 h-6" />, title: "Logros", text: "Canjea progreso por experiencias familiares.", color: "text-brand-amber", bg: "bg-amber-50" },
                  { icon: <Users className="w-6 h-6" />, title: "Conexión", text: "Recupera el diálogo cara a cara sin interrupciones.", color: "text-brand-emerald", bg: "bg-emerald-50" }
                ].map((card, i) => (
                  <motion.div 
                    key={i}
                    whileHover={{ y: -5 }}
                    className="glass-surface p-8 rounded-agency bg-white/95 border-none shadow-premium hover:shadow-mega transition-all"
                  >
                    <div className={`${card.bg} ${card.color} w-12 h-12 rounded-2xl flex items-center justify-center mb-6`}>
                      {card.icon}
                    </div>
                    <h4 className="agency-heading text-xl font-black text-slate-900 mb-2">{card.title}</h4>
                    <p className="text-slate-500 text-sm font-medium leading-relaxed">{card.text}</p>
                  </motion.div>
                ))}
              </div>
            </motion.section>
          )}

          {activeTab === 'reto' && (
            <motion.section
              key="reto"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-12"
            >
              <div className="text-center space-y-4 md:space-y-6">
                <h2 className="agency-heading text-4xl md:text-5xl font-black text-white">Plan de Rescate</h2>
                <div className="max-w-xl mx-auto space-y-3 md:space-y-4">
                  <div className="flex justify-between text-[10px] md:text-xs font-black uppercase text-white/50 tracking-widest px-2">
                    <span>Estado de la Misión</span>
                    <span>{progressCount} / 21 Días</span>
                  </div>
                  <div className="w-full bg-white/10 h-4 md:h-6 rounded-full overflow-hidden p-1 backdrop-blur-md border border-white/20">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${progressPercent}%` }}
                      className="h-full bg-gradient-to-r from-brand-indigo to-brand-violet rounded-full relative"
                    >
                      <div className="absolute inset-0 bg-[linear-gradient(45deg,rgba(255,255,255,0.2)_25%,transparent_25%,transparent_50%,rgba(255,255,255,0.2)_50%,rgba(255,255,255,0.2)_75%,transparent_75%,transparent)] bg-[length:20px_20px]"></div>
                    </motion.div>
                  </div>
                  <p className="text-white/60 text-sm md:text-base font-medium italic">"Pequeños pasos para una gran transformación."</p>
                </div>
              </div>

              <div className="grid grid-cols-4 sm:grid-cols-7 gap-4">
                {Array.from({ length: 21 }, (_, i) => i + 1).map((day) => (
                  <button
                    key={day}
                    onClick={() => setSelectedDay(day)}
                    className={`relative aspect-square flex flex-col items-center justify-center rounded-agency-sm transition-all duration-300 transform active:scale-90 ${
                      selectedDay === day 
                        ? 'bg-white text-slate-900 shadow-mega scale-110 z-10 border-none' 
                        : completedDays.includes(day)
                          ? 'bg-brand-emerald text-white border-none shadow-lg'
                          : 'bg-white/10 text-white/40 border border-white/10 hover:bg-white/20 hover:text-white'
                    }`}
                  >
                    <span className="text-[10px] uppercase font-black tracking-tighter opacity-70 mb-1">Día</span>
                    <span className="text-2xl font-black leading-none">{day}</span>
                    {completedDays.includes(day) && (
                      <div className="absolute -top-2 -right-2 bg-white text-brand-emerald rounded-full p-1 shadow-xl">
                        <CheckCircle2 className="w-5 h-5 fill-current" />
                      </div>
                    )}
                  </button>
                ))}
              </div>

              {selectedDay && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="glass-surface p-10 md:p-14 rounded-agency relative overflow-hidden group border-none shadow-mega bg-white/95"
                >
                  <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none transform translate-x-4 -translate-y-4 group-hover:scale-110 transition-transform duration-700">
                    {TASKS[selectedDay]?.icon || <Activity className="w-48 h-48" />}
                  </div>
                  
                  <div className="relative z-10">
                    <div className="inline-flex items-center px-4 py-2 bg-brand-indigo/10 text-brand-indigo rounded-full text-xs font-black uppercase tracking-widest mb-8">
                      Misión del Día {selectedDay}
                    </div>
                    
                    <h3 className="agency-heading text-4xl md:text-5xl font-black mb-6 text-slate-900">
                      {TASKS[selectedDay]?.title || "Día de Mantenimiento"}
                    </h3>
                    
                    <p className="text-slate-600 text-xl leading-relaxed mb-10 max-w-2xl">
                      {TASKS[selectedDay]?.desc || "Hoy es un día para consolidar los hábitos adquiridos. Realiza una actividad del 'Menú de Alta Dopamina' en familia."}
                    </p>
                    
                    <button
                      onClick={() => toggleDay(selectedDay)}
                      className={`agency-btn text-lg shadow-xl hover:shadow-mega ${
                        completedDays.includes(selectedDay)
                          ? 'bg-brand-emerald hover:bg-emerald-600 text-white'
                          : 'bg-brand-indigo hover:bg-brand-violet text-white'
                      }`}
                    >
                      {completedDays.includes(selectedDay) ? (
                        <>
                          <CheckCircle2 className="w-6 h-6" />
                          <span>¡Misión Cumplida!</span>
                        </>
                      ) : (
                        <span>Completar Misión</span>
                      )}
                    </button>
                  </div>
                </motion.div>
              )}
            </motion.section>
          )}

          {activeTab === 'actividades' && (
            <motion.section
              key="actividades"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="space-y-10"
            >
              <div className="glass-surface p-6 md:p-14 rounded-agency relative overflow-hidden group border-none shadow-mega bg-white/95">
                <div className="absolute top-0 right-0 w-64 h-64 bg-brand-emerald/10 rounded-full blur-3xl -mr-32 -mt-32 transition-transform group-hover:scale-110"></div>
                
                <h2 className="agency-heading text-3xl md:text-4xl font-black text-slate-900 mb-2 md:mb-4 leading-tight">Menú de Alta Dopamina</h2>
                <p className="text-slate-500 text-base md:text-lg mb-8 md:mb-12 max-w-2xl font-medium">Alternativas reales para competir con el brillo de las pantallas. <span className="text-brand-indigo font-bold block sm:inline">Pulsa para ver tutoriales.</span></p>
                
                <div className="grid gap-8 md:gap-10">
                  {[
                    { 
                      level: 'CALMA', 
                      color: 'brand-indigo', 
                      items: [
                        { name: 'Origami fácil', url: 'https://www.youtube.com/results?search_query=origami+facil+niños' },
                        { name: 'Audiolibros', url: 'https://www.spotify.com/es/kids/' },
                        { name: 'Yoga infantil', url: 'https://www.youtube.com/user/SmileandLearn' },
                        { name: 'Pintar mandalas', url: 'https://mandalas.dibujos.net/' }
                      ],
                      icon: <Music className="w-5 h-5 md:w-6 md:h-6" />
                    },
                    { 
                      level: 'CREATIVO', 
                      color: 'brand-amber', 
                      items: [
                        { name: 'Hacer una fortaleza', url: 'https://www.google.com/search?q=como+hacer+una+fortaleza+de+sabanas' },
                        { name: 'Cocinamos pizza', url: 'https://www.pequerecetas.com/' },
                        { name: 'Show de talentos', url: 'https://www.guiainfantil.com/articulos/ocio/juegos/ideas-para-un-concurso-de-talentos-en-familia/' },
                        { name: 'Ciencia casera', url: 'https://www.youtube.com/c/ExpCaseros' }
                      ],
                      icon: <Activity className="w-5 h-5 md:w-6 md:h-6" />
                    },
                    { 
                      level: 'FÍSICO', 
                      color: 'brand-rose', 
                      items: [
                        { name: 'Búsqueda tesoro', url: 'https://www.educapeques.com/estimulacion-psicomotriz/juego-de-la-busqueda-del-tesoro.html' },
                        { name: 'Guerra calcetines', url: 'https://www.google.com/search?q=juego+guerra+de+calcetines' },
                        { name: 'Carrera obstáculos', url: 'https://www.google.com/search?q=circuito+obstaculos+casa+niños' },
                        { name: 'Just Dance real', url: 'https://www.youtube.com/results?search_query=just+dance+kids' }
                      ],
                      icon: <Trophy className="w-5 h-5 md:w-6 md:h-6" />
                    }
                  ].map((cat, idx) => (
                    <div key={idx} className="relative group/cat">
                      <div className="flex items-center space-x-3 md:space-x-4 mb-4 md:mb-6">
                        <div className={`p-2 md:p-3 rounded-2xl bg-slate-50 border border-slate-100 group-hover/cat:scale-110 transition-transform duration-300`}>
                          {React.cloneElement(cat.icon as React.ReactElement, { className: `w-5 h-5 md:w-7 md:h-7 text-${cat.color}` })}
                        </div>
                        <h3 className={`agency-heading text-lg md:text-xl font-black tracking-widest text-slate-800 uppercase`}>{cat.level}</h3>
                      </div>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
                        {cat.items.map((item, i) => (
                          <div key={i} className="flex items-center justify-between p-4 md:p-5 rounded-agency-sm bg-slate-50/50 border border-slate-100 hover:border-brand-emerald/30 hover:bg-white transition-all group overflow-hidden shadow-sm hover:shadow-premium">
                            <div className="flex items-center space-x-3 text-slate-700 font-bold relative z-10 overflow-hidden">
                              <button 
                                onClick={() => toggleActivity(item.name)}
                                className={`w-5 h-5 md:w-6 md:h-6 rounded-lg border-2 transition-all flex items-center justify-center transform group-hover:scale-110 shrink-0 ${
                                  activatedActivities.includes(item.name) ? 'bg-brand-emerald border-brand-emerald shadow-lg shadow-emerald-200' : 'border-slate-300 bg-white'
                                }`}
                              >
                                {activatedActivities.includes(item.name) && <CheckCircle2 className="w-3 h-3 md:w-4 md:h-4 text-white font-bold" />}
                              </button>
                              <span className={`text-xs md:text-sm truncate ${activatedActivities.includes(item.name) ? 'line-through opacity-40 italic' : ''}`}>{item.name}</span>
                            </div>
                            <a 
                              href={item.url} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-brand-indigo/40 hover:text-brand-indigo md:opacity-0 group-hover:opacity-100 transition-all transform md:translate-x-4 md:group-hover:translate-x-0 relative z-10 p-1"
                              title="Ver tutorial"
                            >
                              <ExternalLink className="w-4 h-4 md:w-5 md:h-5" />
                            </a>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.section>
          )}

          {activeTab === 'control' && (
            <motion.section
              key="control"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="space-y-8"
            >
              <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
                {/* Hero / Header Card */}
                <div 
                  className="md:col-span-8 glass-surface p-10 md:p-14 rounded-agency flex flex-col justify-center relative overflow-hidden group border-none shadow-mega bg-white/95"
                >
                  <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-brand-rose/5 rounded-full blur-3xl transition-transform group-hover:scale-125"></div>
                  <div className="flex items-center space-x-6 mb-8 relative z-10">
                    <div className="bg-brand-rose p-4 rounded-agency-sm shadow-xl shadow-rose-200 transform rotate-3">
                      <ShieldCheck className="w-10 h-10 text-white" />
                    </div>
                    <div>
                      <h2 className="agency-heading text-4xl md:text-5xl font-black text-slate-900 tracking-tight leading-none mb-2">El Guardián Técnico</h2>
                      <p className="text-slate-400 font-medium italic text-lg text-balance">Dominando la tecnología para recuperar el tiempo real.</p>
                    </div>
                  </div>
                  <p className="text-slate-600 text-xl leading-relaxed relative z-10 font-medium text-balance">
                    La tecnología no es el enemigo, sino la falta de límites. Configura estas herramientas para que las pantallas vuelvan a ser aliadas y no el centro de la vida de tus hijos.
                  </p>
                </div>

                {/* Advice Card */}
                <div className="md:col-span-4 bg-slate-900 p-10 rounded-agency text-white shadow-mega relative overflow-hidden group flex flex-col justify-center border-t-8 border-brand-indigo">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-brand-indigo/10 blur-3xl group-hover:bg-brand-indigo/20 transition-all"></div>
                  <h3 className="agency-heading text-xl font-black text-brand-indigo mb-6 flex items-center relative z-10 uppercase tracking-widest text-sm">
                    <Star className="w-5 h-5 mr-3 fill-current" />
                    Consejo de Oro
                  </h3>
                  <p className="text-2xl leading-tight italic text-slate-200 relative z-10 font-serif text-balance">
                    "La mejor herramienta de control parental es el diálogo y el ejemplo. Sé tú el cambio que quieres ver."
                  </p>
                </div>

                {/* Quick Tool: Android */}
                <a 
                  href="https://play.google.com/store/apps/details?id=com.google.android.apps.kids.familylink"
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="md:col-span-4 glass-surface p-8 rounded-agency border-none shadow-lg hover:shadow-mega hover:-translate-y-2 transition-all group flex flex-col justify-between h-64"
                >
                  <div className="flex justify-between items-center">
                    <div className="bg-emerald-100 px-4 py-2 rounded-full text-emerald-700 font-black text-xs uppercase tracking-widest leading-none">Android</div>
                    <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm group-hover:bg-brand-emerald group-hover:text-white transition-colors">
                      <ExternalLink className="w-5 h-5" />
                    </div>
                  </div>
                  <div>
                    <h3 className="agency-heading text-3xl font-black text-slate-800 mb-2 leading-none tracking-tight">Family Link</h3>
                    <p className="text-slate-400 text-sm font-bold uppercase tracking-widest opacity-60">Gestión Remota Completa</p>
                  </div>
                </a>

                {/* Quick Tool: Apple */}
                <div className="md:col-span-4 glass-surface p-8 rounded-agency border-none shadow-lg hover:shadow-mega hover:-translate-y-2 transition-all group flex flex-col justify-between h-64">
                  <div className="flex justify-between items-center">
                    <div className="bg-brand-indigo/10 px-4 py-2 rounded-full text-brand-indigo font-black text-xs uppercase tracking-widest leading-none">Apple</div>
                    <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm">
                      <ShieldCheck className="w-6 h-6 text-brand-indigo opacity-30" />
                    </div>
                  </div>
                  <div>
                    <h3 className="agency-heading text-3xl font-black text-slate-800 mb-2 leading-none tracking-tight">Tiempo de Uso</h3>
                    <p className="text-slate-400 text-sm font-bold uppercase tracking-widest opacity-60">Control Nativo iOS</p>
                  </div>
                </div>

                {/* Quick Tool: Video */}
                <a 
                  href="https://www.youtube.com/kids/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="md:col-span-4 glass-surface p-8 rounded-agency border-none shadow-lg hover:shadow-mega hover:-translate-y-2 transition-all group flex flex-col justify-between h-64"
                >
                  <div className="flex justify-between items-center">
                    <div className="bg-brand-rose/10 px-4 py-2 rounded-full text-brand-rose font-black text-xs uppercase tracking-widest leading-none">Seguridad</div>
                    <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm group-hover:bg-brand-rose group-hover:text-white transition-colors">
                      <ExternalLink className="w-5 h-5" />
                    </div>
                  </div>
                  <div>
                    <h3 className="agency-heading text-3xl font-black text-slate-800 mb-2 leading-none tracking-tight">YouTube Kids</h3>
                    <p className="text-slate-400 text-sm font-bold uppercase tracking-widest opacity-60">Filtro de Contenido AI</p>
                  </div>
                </a>

                {/* Protocols and Why combined */}
                <div className="md:col-span-12 grid grid-cols-1 md:grid-cols-2 gap-8 pt-8">
                   <div className="bg-slate-950 p-10 rounded-agency shadow-mega relative overflow-hidden group text-white">
                      <h3 className="agency-heading text-2xl font-black mb-10 flex items-center uppercase tracking-widest">
                        <ShieldAlert className="w-8 h-8 mr-4 text-brand-rose animate-pulse" />
                        Protocolos Críticos
                      </h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        {[
                          { title: 'Roblox', items: ['Restricción de Edad (+9)', 'PIN de Seguridad (Bloqueo de cambios)', 'Bloqueo de Chat y Mensajes'] },
                          { title: 'iOS', items: ['Tiempo de Uso > Restricciones', 'Bloqueo Apps por Categoría', 'Bloqueo de Instalación/Compras'] }
                        ].map((p, i) => (
                          <div key={i} className="p-6 rounded-agency-sm bg-white/5 border border-white/10">
                            <h4 className="font-black text-brand-amber mb-3 uppercase tracking-widest text-xs">{p.title}</h4>
                            <ul className="space-y-2">
                              {p.items.map((item, j) => (
                                <li key={j} className="text-xs font-bold opacity-80 flex items-center">
                                  <CheckCircle2 className="w-3 h-3 mr-2 text-brand-emerald" /> {item}
                                </li>
                              ))}
                            </ul>
                          </div>
                        ))}
                      </div>
                   </div>
                   
                   <div className="glass-surface p-10 rounded-agency shadow-mega border-none bg-white/95 flex flex-col justify-center">
                      <h3 className="agency-heading text-2xl font-black mb-8 flex items-center text-slate-900 uppercase tracking-widest">
                        <Activity className="w-6 h-6 mr-4 text-brand-rose shadow-sm" />
                        ¿Por qué ahora?
                      </h3>
                      <div className="space-y-6">
                        {[
                          { e: '🧠', t: 'El cerebro infantil no tiene freno biológico ante la dopamina rápida.' },
                          { e: '🎣', t: 'Los algoritmos están diseñados para monetizar el tiempo de tus hijos.' }
                        ].map((item, i) => (
                          <div key={i} className="flex items-center space-x-4 p-5 rounded-agency-sm bg-slate-50 border border-slate-100">
                            <span className="text-3xl">{item.e}</span>
                            <p className="text-xs font-black text-slate-600 leading-snug">{item.t}</p>
                          </div>
                        ))}
                      </div>
                   </div>
                </div>
              </div>
            </motion.section>

          )}

          {activeTab === 'imprimibles' && (
            <motion.section
              key="imprimibles"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-8"
            >
              <div className="glass-surface p-8 rounded-agency border-l-8 border-brand-amber text-slate-700 flex flex-col md:flex-row items-center md:items-start space-y-4 md:space-y-0 md:space-x-6 shadow-mega bg-white/95">
                <div className="w-16 h-16 bg-brand-amber/10 rounded-full flex items-center justify-center shrink-0">
                  <Printer className="w-8 h-8 text-brand-amber" />
                </div>
                <div className="space-y-3 flex-1">
                  <p className="agency-heading text-2xl font-black">Centro de Recursos</p>
                  <p className="text-slate-500 font-medium">Material físico para tangibilizar el compromiso y celebrar los logros.</p>
                </div>
              </div>

              {previewItem ? (
                <div className="space-y-8">
                  <div className="glass-surface p-6 rounded-full flex flex-col sm:flex-row justify-between items-center shadow-mega border-none bg-white gap-4">
                    <button 
                      onClick={() => setPreviewItem(null)}
                      className="agency-btn py-2 px-6 bg-slate-100 text-slate-500 hover:text-slate-900 border-none scale-100 text-sm uppercase tracking-widest"
                    >
                      <ChevronLeft className="w-5 h-5" />
                      <span>Volver al Listado</span>
                    </button>
                    <button 
                      onClick={() => handlePrint(previewItem)}
                      className="agency-btn bg-brand-indigo hover:bg-brand-violet text-white shadow-xl hover:shadow-mega py-3 px-8 text-sm uppercase tracking-widest"
                    >
                      <Printer className="w-5 h-5" />
                      <span>Imprimir Documento</span>
                    </button>
                  </div>

                  <motion.div 
                    initial={{ scale: 0.98, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="rounded-agency shadow-mega overflow-hidden border-[16px] border-white relative bg-white"
                  >
                    <div className="max-h-[700px] overflow-y-auto p-8 md:p-16 scroll-smooth bg-slate-50/30">
                      <div className="bg-white shadow-2xl rounded-xl mx-auto overflow-hidden ring-1 ring-slate-100">
                        {previewItem === 'pacto' && renderPacto()}
                        {previewItem === 'diploma' && renderDiploma()}
                        {previewItem === 'cuponera' && renderCuponera()}
                        {previewItem === 'progreso' && renderProgreso()}
                      </div>
                    </div>
                  </motion.div>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <button 
                      onClick={downloadProgress}
                      className="group glass-surface p-10 rounded-agency border-none shadow-premium hover:shadow-mega transition-all text-center space-y-6 hover:-translate-y-2 bg-white/95"
                    >
                      <div className="text-7xl group-hover:scale-110 group-hover:rotate-6 transition-transform duration-500">📊</div>
                      <div>
                        <h3 className="agency-heading text-3xl font-black text-slate-900 mb-2">Copia de Seguridad</h3>
                        <p className="text-slate-400 font-medium italic">Guarda tus estadísticas en formato digital.</p>
                      </div>
                      <div className="agency-btn bg-brand-indigo/10 text-brand-indigo text-xs uppercase tracking-widest py-3">
                        <Download className="w-4 h-4" />
                        <span>Descargar JSON</span>
                      </div>
                    </button>

                    <button 
                      onClick={() => setPreviewItem('progreso')}
                      className="group glass-surface p-10 rounded-agency border-none shadow-premium hover:shadow-mega transition-all text-center space-y-6 hover:-translate-y-2 bg-white/95"
                    >
                      <div className="text-7xl group-hover:scale-110 group-hover:-rotate-6 transition-transform duration-500">📄</div>
                      <div>
                        <h3 className="agency-heading text-3xl font-black text-slate-900 mb-2">Reporte Visual</h3>
                        <p className="text-slate-400 font-medium italic">Un resumen elegante de tu victoria.</p>
                      </div>
                      <div className="agency-btn bg-brand-emerald/10 text-brand-emerald text-xs uppercase tracking-widest py-3">
                        <Search className="w-4 h-4" />
                        <span>Ver Reporte</span>
                      </div>
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-6">
                    {[
                      { id: 'pacto', title: "Pacto", icon: "🤝", desc: "Reglas de oro.", color: 'bg-brand-indigo' },
                      { id: 'diploma', title: "Diploma", icon: "🏆", desc: "Gran Premio.", color: 'bg-brand-rose' },
                      { id: 'cuponera', title: "Cuponera", icon: "🎟️", desc: "Incentivos.", color: 'bg-brand-violet' }
                    ].map((item) => (
                      <button 
                        key={item.id}
                        onClick={() => setPreviewItem(item.id as any)}
                        className={`group glass-surface p-8 rounded-agency border-none shadow-premium hover:shadow-mega hover:-translate-y-2 transition-all text-center space-y-6 bg-white/95`}
                      >
                        <div className="text-6xl group-hover:rotate-12 transition-transform duration-500">{item.icon}</div>
                        <div>
                          <h3 className="agency-heading text-2xl font-black text-slate-800 mb-1">{item.title}</h3>
                          <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest italic">{item.desc}</p>
                        </div>
                        <div className={`agency-btn bg-slate-50 text-slate-400 text-[10px] uppercase tracking-widest py-2 group-hover:bg-brand-indigo group-hover:text-white`}>
                          <Search className="w-3 h-3" />
                          <span>Previo</span>
                        </div>
                      </button>
                    ))}
                  </div>
                </>
              )}
            </motion.section>
          )}


          {activeTab === 'alarma' && (
            <motion.section
              key="alarma"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="space-y-8"
            >
              <div className="glass-surface p-10 md:p-14 rounded-agency border-none shadow-mega bg-white/95 relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-64 h-64 bg-brand-violet/5 rounded-full blur-3xl transition-transform group-hover:scale-110"></div>
                
                <div className="flex items-center space-x-6 mb-12 relative z-10">
                  <div className="bg-brand-violet p-4 rounded-agency-sm shadow-xl shadow-violet-200">
                    <Bell className="w-10 h-10 text-white" />
                  </div>
                  <div>
                    <h2 className="agency-heading text-4xl font-black text-slate-900 tracking-tight leading-none mb-2">Recordatorio Familiar</h2>
                    <p className="text-slate-400 font-medium text-lg">Tu cita diaria con la desconexión.</p>
                  </div>
                </div>

                <div className="flex flex-col items-center space-y-10 relative z-10 w-full max-w-sm mx-auto">
                  <div className="relative w-full">
                    <div className="flex items-center justify-center space-x-4 mb-4">
                      <button 
                        onClick={() => {
                          const [h, m] = alarmTime.split(':');
                          const newH = String((Number(h) + 23) % 24).padStart(2, '0');
                          setAlarmTime(`${newH}:${m}`);
                        }}
                        className="w-12 h-12 bg-white rounded-full shadow-sm flex items-center justify-center hover:bg-slate-50 transition-colors"
                      >
                        <ChevronRight className="w-6 h-6 rotate-180" />
                      </button>
                      <input 
                        type="time" 
                        id="alarm-picker"
                        value={alarmTime}
                        onChange={(e) => setAlarmTime(e.target.value)}
                        className="text-5xl md:text-7xl font-black text-brand-violet bg-slate-50 p-6 md:p-8 rounded-[2.5rem] border-4 border-slate-100 focus:outline-none text-center shadow-inner cursor-pointer"
                      />
                      <button 
                        onClick={() => {
                          const [h, m] = alarmTime.split(':');
                          const newH = String((Number(h) + 1) % 24).padStart(2, '0');
                          setAlarmTime(`${newH}:${m}`);
                        }}
                        className="w-12 h-12 bg-white rounded-full shadow-sm flex items-center justify-center hover:bg-slate-50 transition-colors"
                      >
                        <ChevronRight className="w-6 h-6" />
                      </button>
                    </div>
                    <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 bg-white px-6 py-2 rounded-full border border-slate-100 shadow-sm text-[10px] font-black uppercase tracking-widest text-slate-400">
                      Usa los controles o toca el reloj
                    </div>
                  </div>

                  <button 
                    onClick={() => setAlarmEnabled(!alarmEnabled)}
                    className={`agency-btn py-5 px-10 text-lg shadow-mega hover:shadow-premium w-full ${
                      alarmEnabled 
                        ? 'bg-brand-rose hover:bg-rose-600' 
                        : 'bg-brand-emerald hover:bg-emerald-600'
                    } text-white transition-colors`}
                  >
                    {alarmEnabled ? 'Desactivar Notificación' : 'Activar Notificación'}
                  </button>

                  <div className="max-w-xl text-center bg-slate-50/50 p-8 rounded-agency-sm border border-slate-100">
                    <p className="text-slate-500 italic font-medium leading-relaxed">
                      "La constancia es la partera del hábito. Programar una hora fija ayuda al cerebro de tus hijos a transitar de la pantalla a la realidad sin fricciones."
                    </p>
                  </div>

                  {alarmEnabled && (
                    <motion.div 
                      initial={{ y: 20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      className="flex items-center space-x-3 px-8 py-4 bg-brand-violet/10 text-brand-violet rounded-full border border-brand-violet/20 font-black text-sm uppercase tracking-widest"
                    >
                      <CheckCircle2 className="w-5 h-5" />
                      <span>Notificación activa para las {alarmTime}</span>
                    </motion.div>
                  )}
                </div>
              </div>
            </motion.section>
          )}
        </AnimatePresence>
      </main>

      {/* PRINTABLE SECTIONS (Only visible during printing) */}
      <div className="hidden print:block p-12">
        {/* Pacto Familiar */}
        {printingItem === 'pacto' && renderPacto()}
        
        {/* Diploma */}
        {printingItem === 'diploma' && renderDiploma()}

        {/* Cuponera */}
        {printingItem === 'cuponera' && renderCuponera()}

        {/* Reporte de Progreso */}
        {printingItem === 'progreso' && renderProgreso()}
      </div>

      <footer className="fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-3xl border-t border-slate-100 p-4 flex justify-around items-center print:hidden md:hidden z-50">
        {[
          { id: 'inicio', icon: <Home className="w-6 h-6" /> },
          { id: 'reto', icon: <Calendar className="w-6 h-6" /> },
          { id: 'control', icon: <ShieldCheck className="w-6 h-6" /> },
          { id: 'imprimibles', icon: <Printer className="w-6 h-6" /> },
          { id: 'alarma', icon: <Bell className="w-6 h-6" /> },
        ].map((btn) => (
          <button 
            key={btn.id}
            onClick={() => setActiveTab(btn.id as Tab)} 
            className={`p-4 rounded-2xl transition-all duration-300 transform ${
              activeTab === btn.id 
                ? 'bg-brand-indigo text-white shadow-mega -translate-y-4' 
                : 'text-slate-400 hover:text-brand-indigo overflow-visible'
            }`}
          >
            {btn.icon}
          </button>
        ))}
      </footer>
    </div>
  );
}
