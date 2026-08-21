import React from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Platform,
} from 'react-native';
import Svg, { Rect, Defs, RadialGradient, Stop } from 'react-native-svg';
import { ThemedText } from './themed-text';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface Props {
  onAcceptPact: () => void;
}

export function GreekParchmentPact({ onAcceptPact }: Props) {
  return (
    <View style={styles.container}>
      {/* FONDO AURORA HELÉNICA OSCURA */}
      <View style={StyleSheet.absoluteFill}>
        <Svg width="100%" height="100%" style={StyleSheet.absoluteFill}>
          <Defs>
            <RadialGradient id="parchmentGlow" cx="50%" cy="40%" r="65%">
              <Stop offset="0%" stopColor="#FFE259" stopOpacity="0.18" />
              <Stop offset="45%" stopColor="#D4AF37" stopOpacity="0.08" />
              <Stop offset="80%" stopColor="#040406" stopOpacity="0.95" />
              <Stop offset="100%" stopColor="#020204" stopOpacity="1" />
            </RadialGradient>
          </Defs>
          <Rect x="0" y="0" width="100%" height="100%" fill="url(#parchmentGlow)" />
        </Svg>
      </View>

      {/* TARJETA PAPIRO GRIEGO IMPERIAL */}
      <View style={styles.parchmentCard}>
        {/* GRECAS Y ADORNOS DE ESQUINAS */}
        <View style={styles.cornerTL}>
          <ThemedText style={styles.greekCornerSymbol}>╔═</ThemedText>
        </View>
        <View style={styles.cornerTR}>
          <ThemedText style={styles.greekCornerSymbol}>═╗</ThemedText>
        </View>
        <View style={styles.cornerBL}>
          <ThemedText style={styles.greekCornerSymbol}>╚═</ThemedText>
        </View>
        <View style={styles.cornerBR}>
          <ThemedText style={styles.greekCornerSymbol}>═╝</ThemedText>
        </View>

        {/* CONTENIDO SCROLLABLE DEL MANIFIESTO */}
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* SELLO DEL LAUREL & RAYO */}
          <View style={styles.sealContainer}>
            <View style={styles.sealRing}>
              <ThemedText style={styles.sealEmblem}>⚡</ThemedText>
            </View>
            <ThemedText style={styles.subHeaderGreek}>— DECRETO SAGRADO DE AUTODOMINIO —</ThemedText>
            <ThemedText style={styles.parchmentTitle}>EL PACTO DEL TEMPLO DE ATARAXIA</ThemedText>
            <View style={styles.goldDividerLine} />
          </View>

          {/* CUERPO DEL MANIFIESTO */}
          <View style={styles.textBlock}>
            <ThemedText style={styles.introQuote}>
              «Detente, caminante. Has cruzado el umbral donde termina la mediocridad y comienza el autodominio.»
            </ThemedText>

            <View style={styles.paragraphBox}>
              <ThemedText style={styles.paragraphText}>
                Al ingresar a <ThemedText style={styles.highlightGold}>Ataraxia</ThemedText>, aceptas un desafío que no admite excusas, quejas ni tibiezas.
              </ThemedText>
              <ThemedText style={styles.paragraphText}>
                Si buscas atajos, recompensas fáciles o vienes a jugar a ser atleta, regresa: <ThemedText style={styles.highlightBold}>este no es un parque de juegos para niños</ThemedText>. Aquí se forjan semidioses a través del hierro, la templanza y el esfuerzo consciente.
              </ThemedText>
              <ThemedText style={styles.paragraphText}>
                Si buscas resultados extraordinarios, <ThemedText style={styles.highlightGold}>tómate este viaje con seriedad absoluta o estarás perdiendo tu tiempo</ThemedText>.
              </ThemedText>
            </View>

            {/* SECCIÓN DEL COACH IA */}
            <View style={styles.coachCard}>
              <View style={styles.coachCardHeader}>
                <ThemedText style={styles.coachIcon}>🧠</ThemedText>
                <ThemedText style={styles.coachCardTitle}>TU MENTOR & ORÁCULO PERSONAL</ThemedText>
              </View>
              <ThemedText style={styles.coachCardBody}>
                A tu lado camina un Coach con Inteligencia Suprema, diseñado para conocerte a fondo. Es intuitivo, implacable y cercano.
              </ThemedText>
              <View style={styles.coachCallout}>
                <ThemedText style={styles.coachCalloutText}>
                  ⚡ <ThemedText style={styles.calloutBold}>Mientras más interactúes con él</ThemedText>, más le registres tus comidas, tus niveles de energía, tus dudas y tus sensaciones, <ThemedText style={styles.calloutHighlight}>más sabio, preciso y proactivo se volverá para moldear tu cuerpo y tu mente.</ThemedText>
                </ThemedText>
              </View>
            </View>

            {/* SENTENCIA FINAL */}
            <View style={styles.finalMottoBox}>
              <ThemedText style={styles.finalMottoText}>
                «La gloria no se regala. Se conquista repetición tras repetición.»
              </ThemedText>
            </View>
          </View>

          {/* BOTÓN SOLEMNE DE ACEPTACIÓN DEL PACTO */}
          <View style={styles.actionWrapper}>
            <TouchableOpacity
              style={styles.acceptButton}
              onPress={onAcceptPact}
              activeOpacity={0.85}
            >
              <View style={styles.btnGlowInner}>
                <ThemedText style={styles.btnSparkle}>⚔️</ThemedText>
                <ThemedText style={styles.btnText}>ACEPTO EL DESAFÍO Y JURO CONSTANCIA</ThemedText>
                <ThemedText style={styles.btnSparkle}>⚔️</ThemedText>
              </View>
            </TouchableOpacity>
            <ThemedText style={styles.oathFooterHint}>
              Toca para sellar el pacto y despertar el rayo de tu jornada
            </ThemedText>
          </View>
        </ScrollView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#020204',
    zIndex: 100000,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Platform.OS === 'web' ? 24 : 16,
    paddingVertical: Platform.OS === 'web' ? 24 : 36,
  },
  parchmentCard: {
    width: '100%',
    maxWidth: 520,
    height: '100%',
    maxHeight: 740,
    backgroundColor: 'rgba(9, 12, 22, 0.98)',
    borderRadius: 20,
    borderWidth: 1.8,
    borderColor: 'rgba(212, 175, 55, 0.65)',
    shadowColor: '#D4AF37',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.45,
    shadowRadius: 20,
    elevation: 10,
    position: 'relative',
    overflow: 'hidden',
  },
  cornerTL: {
    position: 'absolute',
    top: 6,
    left: 8,
    zIndex: 10,
  },
  cornerTR: {
    position: 'absolute',
    top: 6,
    right: 8,
    zIndex: 10,
  },
  cornerBL: {
    position: 'absolute',
    bottom: 6,
    left: 8,
    zIndex: 10,
  },
  cornerBR: {
    position: 'absolute',
    bottom: 6,
    right: 8,
    zIndex: 10,
  },
  greekCornerSymbol: {
    fontSize: 16,
    color: '#FFE259',
    fontWeight: '900',
    opacity: 0.9,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 28,
    alignItems: 'center',
  },
  sealContainer: {
    alignItems: 'center',
    marginBottom: 16,
    width: '100%',
  },
  sealRing: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: 'rgba(212, 175, 55, 0.20)',
    borderWidth: 2,
    borderColor: '#FFE259',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
    shadowColor: '#FFE259',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 10,
  },
  sealEmblem: {
    fontSize: 26,
  },
  subHeaderGreek: {
    fontSize: 9.5,
    fontFamily: 'monospace',
    color: '#D4AF37',
    letterSpacing: 2.2,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  parchmentTitle: {
    fontSize: Platform.OS === 'web' ? 22 : 19,
    fontWeight: '900',
    color: '#FFFDE0',
    letterSpacing: 2,
    textAlign: 'center',
    fontFamily: Platform.OS === 'ios' ? 'Cinzel' : 'serif',
    textShadowColor: 'rgba(212, 175, 55, 0.8)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 10,
  },
  goldDividerLine: {
    width: 140,
    height: 2,
    backgroundColor: '#D4AF37',
    marginTop: 10,
    borderRadius: 1,
  },
  textBlock: {
    width: '100%',
    gap: 14,
  },
  introQuote: {
    fontSize: 13,
    fontStyle: 'italic',
    fontFamily: 'serif',
    color: '#FFE259',
    textAlign: 'center',
    lineHeight: 19,
    backgroundColor: 'rgba(212, 175, 55, 0.12)',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 10,
    borderLeftWidth: 3,
    borderLeftColor: '#FFE259',
  },
  paragraphBox: {
    gap: 10,
  },
  paragraphText: {
    fontSize: 12.5,
    color: '#CBD5E1',
    lineHeight: 18.5,
    textAlign: 'justify',
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
  },
  highlightGold: {
    color: '#FFE259',
    fontWeight: 'bold',
  },
  highlightBold: {
    color: '#F8FAFC',
    fontWeight: 'bold',
  },
  coachCard: {
    backgroundColor: 'rgba(15, 23, 42, 0.95)',
    borderRadius: 14,
    borderWidth: 1.2,
    borderColor: 'rgba(212, 175, 55, 0.45)',
    padding: 14,
    gap: 8,
    marginTop: 4,
  },
  coachCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  coachIcon: {
    fontSize: 18,
  },
  coachCardTitle: {
    fontSize: 11,
    fontWeight: '900',
    fontFamily: 'monospace',
    color: '#FFE259',
    letterSpacing: 1.5,
  },
  coachCardBody: {
    fontSize: 12,
    color: '#94A3B8',
    lineHeight: 17,
  },
  coachCallout: {
    backgroundColor: 'rgba(212, 175, 55, 0.12)',
    borderRadius: 8,
    padding: 10,
    borderLeftWidth: 3,
    borderLeftColor: '#D4AF37',
  },
  coachCalloutText: {
    fontSize: 11.5,
    color: '#E2E8F0',
    lineHeight: 17,
  },
  calloutBold: {
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  calloutHighlight: {
    color: '#FFE259',
    fontWeight: 'bold',
  },
  finalMottoBox: {
    alignItems: 'center',
    marginTop: 4,
    paddingVertical: 6,
  },
  finalMottoText: {
    fontSize: 12,
    fontStyle: 'italic',
    color: '#D4AF37',
    textAlign: 'center',
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  actionWrapper: {
    width: '100%',
    alignItems: 'center',
    marginTop: 18,
    gap: 8,
  },
  acceptButton: {
    width: '100%',
    backgroundColor: '#D4AF37',
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#FFE259',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.75,
    shadowRadius: 14,
    elevation: 8,
  },
  btnGlowInner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  btnSparkle: {
    fontSize: 14,
  },
  btnText: {
    fontSize: 11.5,
    fontWeight: '900',
    color: '#050507',
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    letterSpacing: 1.2,
    textAlign: 'center',
  },
  oathFooterHint: {
    fontSize: 9.5,
    fontFamily: 'monospace',
    color: 'rgba(212, 175, 55, 0.65)',
    letterSpacing: 0.8,
    textAlign: 'center',
  },
});
