import React, { useState, useEffect } from 'react';
import { StyleSheet, View, TextInput, ScrollView, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { ThemedText } from '@/components/themed-text';
import { PearlElectricBackground } from '@/components/PearlElectricBackground';
import { SafeStorage } from '@/utils/safeStorage';

const ARCHETYPES_DATA = {
  // LEGIÓN FEMENINA
  athena: {
    name: '🦉 Atenea Estratega',
    gender: 'female',
    themeColor: '#10B981',
    accentColor: '#FB7185',
    title: 'TEMPLO DE ATENEA & SABIDURÍA',
    focus: 'Estrategia, Cintura Compacta & Core Blindado',
    routine: 'Vacío Abdominal 4x30s • Plancha Dinámica • Deltoides Laterales 4x15 • Remo Neutro',
    quote: '"La victoria no se ruega a los dioses; se planea con frialdad y se ejecuta con honor."',
    author: 'Atenea',
    nutritionFocus: 'Alta proteína magra, magnesio bisglicinato e hidratación electrolítica.',
  },
  artemis: {
    name: '🏹 Artemisa Cazadora',
    gender: 'female',
    themeColor: '#FB7185',
    accentColor: '#D4AF37',
    title: 'SANTUARIO DE ARTEMISA & POTENCIA',
    focus: 'Fuerza Atlética, Glúteos & Cadena Posterior',
    routine: 'Hip Thrust Pesado 4x10 (Pausa 2s) • Peso Muerto Rumano (RDL) 4x8 • Zancadas Búlgaras 3x12',
    quote: '"Mi cuerpo no es un adorno para la mirada ajena; es un arma afinada para la conquista."',
    author: 'Artemisa',
    nutritionFocus: 'Grasas saludables (Omega-3, aguacate) y carbohidratos complejos en fase folicular.',
  },
  gorgo_sparta: {
    name: '🛡️ Gorgo Reina de Esparta',
    gender: 'female',
    themeColor: '#E11D48',
    accentColor: '#F59E0B',
    title: 'TEMPLO DE GORGO & FUERZA MÁXIMA',
    focus: 'Fuerza Máxima, Sobrecarga & Carácter de Hierro',
    routine: 'Sentadilla Profunda 5x5 • Fondos en Paralelas • Dominadas Asistidas 4x6 • Paseo del Granjero',
    quote: '"Las mujeres de Esparta gobernamos porque forjamos el carácter de leones."',
    author: 'Gorgo de Esparta',
    nutritionFocus: '2.0g/kg de proteína, hierro biodisponible y creatina monohidrato.',
  },
  aphrodite_urania: {
    name: '⚡ Afrodita Urania',
    gender: 'female',
    themeColor: '#C084FC',
    accentColor: '#FB7185',
    title: 'TEMPLO DE AFRODITA & ARMONÍA',
    focus: 'V-Taper Femenino, Estética & Salud Hormonal',
    routine: 'Elevaciones Laterales 5x15 • Prensa Inclinada 4x12 • Patada de Glúteo en Polea 4x15',
    quote: '"La belleza forjada con disciplina y salud celular trasciende cualquier vanidad frágil."',
    author: 'Afrodita Urania',
    nutritionFocus: 'Antioxidantes celulares, colágeno hidrolizado y balance estrogénico.',
  },

  // LEGIÓN MASCULINA
  leonidas: {
    name: '🦁 Leónidas de Esparta',
    gender: 'male',
    themeColor: '#D4AF37',
    accentColor: '#EF4444',
    title: 'TEMPLO ESPARTANO & SOBRECARGA',
    focus: 'Fuerza Bruta, Hipertrofia & RIR 2',
    routine: 'Sentadilla Trasera 4x6 • Press Militar con Barra 4x6 • Dominadas Lastradas 4x6',
    quote: '"El dolor es temporal; el templo de hierro que forjas hoy te sobrevivirá."',
    author: 'Leónidas de Esparta',
    nutritionFocus: 'Superávit magro +250 kcal, 2.2g/kg de proteína y creatina 5g/día.',
  },
  marcus_aurelius: {
    name: '🏛️ Marco Aurelio',
    gender: 'male',
    themeColor: '#38BDF8',
    accentColor: '#D4AF37',
    title: 'TEMPLO DE LA VIRTUD DEL EMPERADOR',
    focus: 'Temple Mental, Resistencia & Compostura',
    routine: 'Peso Muerto Convencional 4x5 • Press de Banca 4x8 • Remo con Barra 4x8',
    quote: '"No pierdas más tiempo discutiendo lo que debe ser un buen hombre; sé uno."',
    author: 'Marco Aurelio',
    nutritionFocus: 'Dieta antiinflamatoria, ayuno intermitente 16/8 y magnesio nocturno.',
  },
  achilles: {
    name: '⚡ Aquiles el Inmortal',
    gender: 'male',
    themeColor: '#F59E0B',
    accentColor: '#10B981',
    title: 'TEMPLO DE AQUILES & ATLETISMO',
    focus: 'Velocidad, Potencia & Mitocondrial Zona 2',
    routine: 'Sprints en Cuesta 8x50m • Clean and Press 5x3 • Saltos al Cajón 4x8',
    quote: '"La gloria eterna pertenece a quienes no conocen la duda en el fragor de la batalla."',
    author: 'Aquiles',
    nutritionFocus: 'Carga glucogénica estratégica e hidratación con sales minerales.',
  },
  epictetus: {
    name: '📜 Epicteto',
    gender: 'male',
    themeColor: '#A855F7',
    accentColor: '#38BDF8',
    title: 'TEMPLO DE LA CALISTENIA & AUTODOMINIO',
    focus: 'Dominio del Peso Corporal & Claridad Mental',
    routine: 'Muscle-ups • Fondos en Anillas 4x10 • L-Sit 4x20s • Flexiones a Pino',
    quote: '"No son las cosas las que nos atormentan, sino el juicio que hacemos de ellas."',
    author: 'Epicteto',
    nutritionFocus: 'Nutrición minimalista, ayuno profundo y densidad de micronutrientes.',
  },
};

export default function ArchonThroneScreen() {
  const [selectedArchetypeKey, setSelectedArchetypeKey] = useState<string>('artemis');
  const [targetAudience, setTargetAudience] = useState<'all' | 'female' | 'male'>('all');
  const [decreeInput, setDecreeInput] = useState<string>('');
  const [activeDecree, setActiveDecree] = useState<string>(
    SafeStorage.getItem('ataraxia_active_decree') || 'Todo recluta aumentará hoy la ingesta de agua y cumplirá su sobrecarga con honor.'
  );

  useEffect(() => {
    SafeStorage.setItem('ataraxia_archon_auth_v1', 'true');
    SafeStorage.setItem('ataraxia_is_archon_master', 'true');
  }, []);

  const currentArchetype = ARCHETYPES_DATA[selectedArchetypeKey as keyof typeof ARCHETYPES_DATA] || ARCHETYPES_DATA.artemis;

  const handlePublishSegmentedDecree = () => {
    if (!decreeInput.trim()) {
      alert('Arconte: Ingresa el mandato antes de emitir el decreto.');
      return;
    }
    const audienceLabel = targetAudience === 'female' ? '👑 GUERRERAS' : targetAudience === 'male' ? '⚔️ GUERREROS' : '🏛️ TODA LA LEGIÓN';
    const formatted = `[${audienceLabel}] ${decreeInput}`;
    setActiveDecree(formatted);
    SafeStorage.setItem('ataraxia_active_decree', formatted);
    setDecreeInput('');
    alert(`🏛️ DECRETO EMITIDO para ${audienceLabel}: Transmitido con éxito.`);
  };

  // CONSOLA SUPREMA DE CONTROL DEL TRONO (GOBERNANZA PURA DIRECTA)
  return (
    <PearlElectricBackground glowColor={currentArchetype.themeColor + '40'}>
      <SafeAreaView style={styles.safeArea}>
        <ScrollView style={styles.scrollView} contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
          
          {/* CABECERA MAESTRA DEL ARCONTE */}
          <View style={styles.header}>
            <View style={styles.headerTopRow}>
              <View style={styles.badgeRow}>
                <ThemedText style={styles.goldBadge}>👑 CONSOLA SUPREMA DEL ARCONTE</ThemedText>
              </View>
            </View>

            <ThemedText style={styles.title}>TRONO DE GOBERNANZA TOTAL</ThemedText>
            <ThemedText style={styles.subtitle}>Visión panóptica de géneros, auditoría de arquetipos y mando de la legión</ThemedText>
          </View>

          {/* 1. VISOR & AUDITORÍA DE LOS 8 ARQUETIPOS */}
          <View style={styles.card}>
            <ThemedText style={styles.cardTitle}>👁️ VISOR PANÓPTICO: LOS 8 ARQUETIPOS SAGRADOS</ThemedText>
            <ThemedText style={styles.cardDesc}>Audita y previsualiza la experiencia de cada división:</ThemedText>

            {/* LEGIÓN FEMENINA */}
            <ThemedText style={styles.sectionHeaderFemale}>👑 LEGIÓN FEMENINA (ATENEA & ARTEMISA):</ThemedText>
            <View style={styles.archetypesRow}>
              {(['artemis', 'athena', 'gorgo_sparta', 'aphrodite_urania'] as const).map((key) => {
                const arch = ARCHETYPES_DATA[key];
                const isSelected = selectedArchetypeKey === key;
                return (
                  <Pressable
                    key={key}
                    style={[
                      styles.archBtn,
                      isSelected && { borderColor: arch.themeColor, backgroundColor: arch.themeColor + '30' }
                    ]}
                    onPress={() => setSelectedArchetypeKey(key)}
                  >
                    <ThemedText style={[styles.archBtnText, isSelected && { color: '#FFFFFF', fontWeight: '900' }]}>
                      {arch.name}
                    </ThemedText>
                  </Pressable>
                );
              })}
            </View>

            {/* LEGIÓN MASCULINA */}
            <ThemedText style={styles.sectionHeaderMale}>⚔️ LEGIÓN MASCULINA (ESPARTA & FILÓSOFOS):</ThemedText>
            <View style={styles.archetypesRow}>
              {(['leonidas', 'marcus_aurelius', 'achilles', 'epictetus'] as const).map((key) => {
                const arch = ARCHETYPES_DATA[key];
                const isSelected = selectedArchetypeKey === key;
                return (
                  <Pressable
                    key={key}
                    style={[
                      styles.archBtn,
                      isSelected && { borderColor: arch.themeColor, backgroundColor: arch.themeColor + '30' }
                    ]}
                    onPress={() => setSelectedArchetypeKey(key)}
                  >
                    <ThemedText style={[styles.archBtnText, isSelected && { color: '#FFFFFF', fontWeight: '900' }]}>
                      {arch.name}
                    </ThemedText>
                  </Pressable>
                );
              })}
            </View>

            {/* PREVISUALIZADOR EN VIVO */}
            <View style={[styles.previewBox, { borderColor: currentArchetype.themeColor }]}>
              <View style={styles.previewHeaderRow}>
                <ThemedText style={[styles.previewArchetypeName, { color: currentArchetype.themeColor }]}>
                  {currentArchetype.name.toUpperCase()}
                </ThemedText>
                <ThemedText style={styles.previewGenderTag}>
                  {currentArchetype.gender === 'female' ? '👑 PERFIL FEMENINO' : '⚔️ PERFIL MASCULINO'}
                </ThemedText>
              </View>

              <ThemedText style={styles.previewTitleText}>{currentArchetype.title}</ThemedText>
              <ThemedText style={styles.previewFocusText}>🎯 Foco Biomecánico: {currentArchetype.focus}</ThemedText>
              
              <View style={styles.routineBox}>
                <ThemedText style={styles.routineTitle}>🏋️‍♂️ Rutina Táctica de la Senda:</ThemedText>
                <ThemedText style={styles.routineContent}>{currentArchetype.routine}</ThemedText>
              </View>

              <View style={styles.nutritionBox}>
                <ThemedText style={styles.nutritionTitle}>🥗 Foco Metabólico & Nutricional:</ThemedText>
                <ThemedText style={styles.nutritionContent}>{currentArchetype.nutritionFocus}</ThemedText>
              </View>

              <ThemedText style={styles.quoteText}>{currentArchetype.quote} — {currentArchetype.author}</ThemedText>
            </View>
          </View>

          {/* 2. TELEMETRÍA SEGREGADA POR GÉNERO */}
          <View style={styles.card}>
            <ThemedText style={styles.cardTitle}>📊 TELEMETRÍA SEGREGADA POR LEGIÓN</ThemedText>
            
            <View style={styles.genderStatsRow}>
              {/* Mujeres */}
              <View style={[styles.genderStatCard, { borderColor: 'rgba(251, 113, 133, 0.4)' }]}>
                <ThemedText style={[styles.genderStatTitle, { color: '#FB7185' }]}>👑 LEGIÓN FEMENINA</ThemedText>
                <ThemedText style={styles.genderStatNumber}>580</ThemedText>
                <ThemedText style={styles.genderStatSub}>Guerreras Activas</ThemedText>
                <ThemedText style={styles.genderStatPact}>🏛️ Pacto: 92.1% (A+)</ThemedText>
                <ThemedText style={styles.topExerciseText}>Top: Hip Thrust & RDL</ThemedText>
              </View>

              {/* Hombres */}
              <View style={[styles.genderStatCard, { borderColor: 'rgba(212, 175, 55, 0.4)' }]}>
                <ThemedText style={[styles.genderStatTitle, { color: '#D4AF37' }]}>⚔️ LEGIÓN MASCULINA</ThemedText>
                <ThemedText style={styles.genderStatNumber}>668</ThemedText>
                <ThemedText style={styles.genderStatSub}>Guerreros Activos</ThemedText>
                <ThemedText style={styles.genderStatPact}>🏛️ Pacto: 87.2% (A)</ThemedText>
                <ThemedText style={styles.topExerciseText}>Top: Sentadilla & Banca</ThemedText>
              </View>
            </View>
          </View>

          {/* 3. EMISOR DE DECRETOS SEGMENTADOS */}
          <View style={styles.card}>
            <ThemedText style={styles.cardTitle}>📜 EMISOR DE DECRETOS SEGMENTADOS</ThemedText>
            
            <View style={styles.activeDecreeBox}>
              <ThemedText style={styles.activeDecreeLabel}>🟢 DECRETO ACTIVO EN TRANSMISIÓN:</ThemedText>
              <ThemedText style={styles.activeDecreeValue}>"{activeDecree}"</ThemedText>
            </View>

            <ThemedText style={styles.subPrompt}>Selecciona la audiencia de este decreto:</ThemedText>
            <View style={styles.audienceSelectorRow}>
              <Pressable
                style={[styles.audienceBtn, targetAudience === 'all' && styles.audienceBtnActiveAll]}
                onPress={() => setTargetAudience('all')}
              >
                <ThemedText style={[styles.audienceBtnText, targetAudience === 'all' && { color: '#FFFFFF', fontWeight: 'bold' }]}>
                  🏛️ Toda la Legión
                </ThemedText>
              </Pressable>

              <Pressable
                style={[styles.audienceBtn, targetAudience === 'female' && styles.audienceBtnActiveFemale]}
                onPress={() => setTargetAudience('female')}
              >
                <ThemedText style={[styles.audienceBtnText, targetAudience === 'female' && { color: '#FB7185', fontWeight: 'bold' }]}>
                  👑 Solo Guerreras
                </ThemedText>
              </Pressable>

              <Pressable
                style={[styles.audienceBtn, targetAudience === 'male' && styles.audienceBtnActiveMale]}
                onPress={() => setTargetAudience('male')}
              >
                <ThemedText style={[styles.audienceBtnText, targetAudience === 'male' && { color: '#FDE68A', fontWeight: 'bold' }]}>
                  ⚔️ Solo Guerreros
                </ThemedText>
              </Pressable>
            </View>

            <TextInput
              style={styles.decreeInput}
              placeholder="Redacta la directriz marcial para la audiencia seleccionada..."
              placeholderTextColor="#64748B"
              value={decreeInput}
              onChangeText={setDecreeInput}
              multiline
            />

            <Pressable style={styles.publishBtn} onPress={handlePublishSegmentedDecree}>
              <LinearGradient colors={['#D4AF37', '#F59E0B', '#B45309']} style={styles.publishGradient}>
                <ThemedText style={styles.publishBtnText}>🚀 TRANSMITIR DECRETO SEGMENTADO</ThemedText>
              </LinearGradient>
            </Pressable>
          </View>

        </ScrollView>
      </SafeAreaView>
    </PearlElectricBackground>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  scrollView: { flex: 1, zIndex: 10 },
  container: { padding: 18, gap: 16, maxWidth: 680, alignSelf: 'center', width: '100%', paddingBottom: 60 },
  header: { alignItems: 'center', gap: 4 },
  headerTopRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', width: '100%' },
  badgeRow: { backgroundColor: 'rgba(212, 175, 55, 0.15)', paddingHorizontal: 14, paddingVertical: 4, borderRadius: 12, borderWidth: 1, borderColor: 'rgba(212, 175, 55, 0.4)' },
  goldBadge: { fontSize: 11, fontFamily: 'monospace', fontWeight: 'bold', color: '#D4AF37', letterSpacing: 2 },
  logoutBtn: { paddingVertical: 4, paddingHorizontal: 10, borderRadius: 8, backgroundColor: 'rgba(239, 68, 68, 0.15)', borderWidth: 1, borderColor: 'rgba(239, 68, 68, 0.4)' },
  logoutBtnText: { fontSize: 10, color: '#FCA5A5', fontFamily: 'monospace', fontWeight: 'bold' },
  title: { fontSize: 26, fontWeight: '900', color: '#FFFFFF', letterSpacing: 1, marginTop: 4 },
  subtitle: { fontSize: 12, color: '#94A3B8', textAlign: 'center' },
  card: { backgroundColor: 'rgba(14, 20, 36, 0.95)', borderRadius: 18, padding: 16, borderWidth: 1, borderColor: 'rgba(212, 175, 55, 0.35)', gap: 10, zIndex: 15 },
  cardTitle: { fontSize: 11.5, fontFamily: 'monospace', fontWeight: 'bold', color: '#D4AF37', letterSpacing: 1 },
  cardDesc: { fontSize: 11.5, color: '#94A3B8' },
  sectionHeaderFemale: { fontSize: 10.5, fontFamily: 'monospace', fontWeight: 'bold', color: '#FB7185', marginTop: 4 },
  sectionHeaderMale: { fontSize: 10.5, fontFamily: 'monospace', fontWeight: 'bold', color: '#FDE68A', marginTop: 8 },
  archetypesRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  archBtn: { paddingVertical: 8, paddingHorizontal: 10, borderRadius: 10, backgroundColor: 'rgba(15, 23, 42, 0.8)', borderWidth: 1, borderColor: 'rgba(148, 163, 184, 0.2)' },
  archBtnText: { fontSize: 11, color: '#94A3B8' },
  previewBox: { backgroundColor: 'rgba(10, 14, 26, 0.92)', borderRadius: 14, padding: 14, borderWidth: 1.5, gap: 6, marginTop: 8 },
  previewHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  previewArchetypeName: { fontSize: 13, fontWeight: '900', fontFamily: 'monospace' },
  previewGenderTag: { fontSize: 9.5, color: '#94A3B8', fontFamily: 'monospace', fontWeight: 'bold' },
  previewTitleText: { fontSize: 13, fontWeight: 'bold', color: '#FFFFFF' },
  previewFocusText: { fontSize: 11.5, color: '#FDE68A', fontWeight: '600' },
  routineBox: { backgroundColor: 'rgba(15, 23, 42, 0.85)', padding: 10, borderRadius: 10, borderWidth: 1, borderColor: 'rgba(148, 163, 184, 0.15)', gap: 2 },
  routineTitle: { fontSize: 10.5, fontWeight: 'bold', color: '#38BDF8' },
  routineContent: { fontSize: 11, color: '#E2E8F0', lineHeight: 15 },
  nutritionBox: { backgroundColor: 'rgba(15, 23, 42, 0.85)', padding: 10, borderRadius: 10, borderWidth: 1, borderColor: 'rgba(148, 163, 184, 0.15)', gap: 2 },
  nutritionTitle: { fontSize: 10.5, fontWeight: 'bold', color: '#10B981' },
  nutritionContent: { fontSize: 11, color: '#E2E8F0', lineHeight: 15 },
  quoteText: { fontSize: 11, fontStyle: 'italic', color: '#94A3B8', marginTop: 4 },
  genderStatsRow: { flexDirection: 'row', gap: 10 },
  genderStatCard: { flex: 1, backgroundColor: 'rgba(15, 23, 42, 0.85)', borderRadius: 14, padding: 12, borderWidth: 1, alignItems: 'center', gap: 2 },
  genderStatTitle: { fontSize: 10.5, fontWeight: 'bold', fontFamily: 'monospace' },
  genderStatNumber: { fontSize: 24, fontWeight: '900', color: '#FFFFFF', fontFamily: 'monospace' },
  genderStatSub: { fontSize: 9.5, color: '#94A3B8' },
  genderStatPact: { fontSize: 11, color: '#34D399', fontWeight: 'bold', marginTop: 4 },
  topExerciseText: { fontSize: 9, color: '#CBD5E1', fontStyle: 'italic', textAlign: 'center' },
  activeDecreeBox: { backgroundColor: 'rgba(16, 185, 129, 0.1)', borderRadius: 10, padding: 10, borderWidth: 1, borderColor: 'rgba(16, 185, 129, 0.3)', gap: 2 },
  activeDecreeLabel: { fontSize: 9.5, fontFamily: 'monospace', fontWeight: 'bold', color: '#34D399' },
  activeDecreeValue: { fontSize: 11.5, color: '#E2E8F0', fontStyle: 'italic' },
  subPrompt: { fontSize: 11, color: '#94A3B8', marginTop: 2 },
  audienceSelectorRow: { flexDirection: 'row', gap: 6 },
  audienceBtn: { flex: 1, paddingVertical: 8, borderRadius: 10, backgroundColor: 'rgba(15, 23, 42, 0.8)', borderWidth: 1, borderColor: 'rgba(148, 163, 184, 0.2)', alignItems: 'center' },
  audienceBtnActiveAll: { borderColor: '#D4AF37', backgroundColor: 'rgba(212, 175, 55, 0.2)' },
  audienceBtnActiveFemale: { borderColor: '#FB7185', backgroundColor: 'rgba(251, 113, 133, 0.2)' },
  audienceBtnActiveMale: { borderColor: '#F59E0B', backgroundColor: 'rgba(245, 158, 11, 0.2)' },
  audienceBtnText: { fontSize: 10.5, color: '#94A3B8' },
  decreeInput: { backgroundColor: 'rgba(15, 23, 42, 0.9)', borderRadius: 12, padding: 12, borderWidth: 1, borderColor: 'rgba(212, 175, 55, 0.3)', color: '#FFFFFF', fontSize: 12, minHeight: 60, textAlignVertical: 'top' },
  publishBtn: { borderRadius: 14, overflow: 'hidden' },
  publishGradient: { paddingVertical: 12, alignItems: 'center', justifyContent: 'center' },
  publishBtnText: { fontSize: 12, fontWeight: '900', color: '#05070D', letterSpacing: 1 },

  // ESTILOS DE ACCESO EXCLUSIVO
  loginContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20, maxWidth: 460, alignSelf: 'center', width: '100%' },
  crownCircle: { width: 72, height: 72, borderRadius: 36, backgroundColor: 'rgba(212, 175, 55, 0.15)', borderWidth: 1.5, borderColor: '#D4AF37', alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
  loginGoldBadge: { fontSize: 11, fontFamily: 'monospace', fontWeight: 'bold', color: '#D4AF37', letterSpacing: 2 },
  loginTitle: { fontSize: 28, fontWeight: '900', color: '#FFFFFF', letterSpacing: 1, marginBottom: 4 },
  loginSubtitle: { fontSize: 12, color: '#94A3B8', textAlign: 'center', marginBottom: 20, lineHeight: 16 },
  loginCard: { width: '100%', backgroundColor: 'rgba(14, 20, 36, 0.95)', borderRadius: 18, padding: 20, borderWidth: 1, borderColor: 'rgba(212, 175, 55, 0.35)', gap: 12 },
  inputLabel: { fontSize: 10, fontFamily: 'monospace', fontWeight: 'bold', color: '#D4AF37', letterSpacing: 1 },
  loginInput: { backgroundColor: 'rgba(15, 23, 42, 0.9)', borderRadius: 12, padding: 12, borderWidth: 1, borderColor: 'rgba(212, 175, 55, 0.3)', color: '#FFFFFF', fontSize: 13 },
  errorText: { fontSize: 11, color: '#EF4444', textAlign: 'center' },
  loginBtn: { borderRadius: 14, overflow: 'hidden', marginTop: 8 },
  loginGradient: { paddingVertical: 14, alignItems: 'center', justifyContent: 'center' },
  loginBtnText: { fontSize: 13, fontWeight: '900', color: '#05070D', letterSpacing: 1 },
});
