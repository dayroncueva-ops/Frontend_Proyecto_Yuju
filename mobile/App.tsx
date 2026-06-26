import { StatusBar } from 'expo-status-bar'
import * as DocumentPicker from 'expo-document-picker'
import { CameraView, useCameraPermissions, type CameraCapturedPicture } from 'expo-camera'
import { RecordingPresets, requestRecordingPermissionsAsync, setAudioModeAsync, useAudioRecorder, useAudioRecorderState } from 'expo-audio'
import { useCallback, useEffect, useRef, useState } from 'react'
import {
  ActivityIndicator,
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native'
import { initialMaterial, initialPlanner, initialProgress } from './src/config'
import { clearSession, getStoredSession, login, register, storeSession } from './src/services/auth'
import * as workspace from './src/services/workspace'
import type {
  LoginForm,
  Material,
  MaterialForm,
  MobileView,
  Notice,
  Planner,
  PlannerForm,
  Progress,
  ProgressForm,
  Recommendation,
  RegisterForm,
  Session,
} from './src/types'

type WorkspaceState = {
  materials: Material[]
  planners: Planner[]
  progress: Progress | null
  recommendations: Recommendation[]
}

const emptyWorkspace: WorkspaceState = {
  materials: [],
  planners: [],
  progress: null,
  recommendations: [],
}

const tabs: Array<{ key: MobileView; label: string }> = [
  { key: 'inicio', label: 'Inicio' },
  { key: 'planes', label: 'Planes' },
  { key: 'materiales', label: 'Materiales' },
  { key: 'mentor', label: 'Mentor' },
  { key: 'sensores', label: 'Sensores' },
]

export default function App() {
  const [booting, setBooting] = useState(true)
  const [loading, setLoading] = useState(false)
  const [session, setSession] = useState<Session | null>(null)
  const [notice, setNotice] = useState<Notice>(null)
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login')
  const [view, setView] = useState<MobileView>('inicio')
  const [data, setData] = useState<WorkspaceState>(emptyWorkspace)

  const [loginForm, setLoginForm] = useState<LoginForm>({ email: '', password: '' })
  const [registerForm, setRegisterForm] = useState<RegisterForm>({ firstName: '', lastName: '', email: '', password: '', username: '', age: 18 })
  const [plannerForm, setPlannerForm] = useState<PlannerForm>(initialPlanner)
  const [progressForm, setProgressForm] = useState<ProgressForm>(initialProgress)
  const [materialForm, setMaterialForm] = useState<MaterialForm>(initialMaterial)
  const [selectedFile, setSelectedFile] = useState<workspace.LocalUploadFile | null>(null)
  const [prompt, setPrompt] = useState('Como puedo organizarme mejor para estudiar esta semana?')
  const [mentorAnswer, setMentorAnswer] = useState('')

  const token = session?.accessToken ?? ''

  const loadWorkspace = useCallback(async () => {
    if (!token) return
    setLoading(true)
    try {
      const [materials, planners, progress, recommendations] = await Promise.allSettled([
        workspace.getMaterials(token),
        workspace.getPlanners(token),
        workspace.getProgress(token),
        workspace.getRecommendations(token),
      ])

      setData({
        materials: materials.status === 'fulfilled' ? materials.value : [],
        planners: planners.status === 'fulfilled' ? planners.value : [],
        progress: progress.status === 'fulfilled' ? progress.value : null,
        recommendations: recommendations.status === 'fulfilled' ? recommendations.value : [],
      })
    } finally {
      setLoading(false)
    }
  }, [token])

  useEffect(() => {
    getStoredSession()
      .then((stored) => {
        if (stored) setSession(stored)
      })
      .finally(() => setBooting(false))
  }, [])

  useEffect(() => {
    if (session) void loadWorkspace()
  }, [session, loadWorkspace])

  useEffect(() => {
    const activePlan = data.planners[0]
    if (!activePlan) return
    setPlannerForm({
      weeklyGoal: activePlan.weeklyGoal,
      targetHours: activePlan.targetHours,
      startDate: activePlan.startDate,
      endDate: activePlan.endDate,
      priority: activePlan.priority,
      planStatus: activePlan.planStatus,
    })
  }, [data.planners])

  useEffect(() => {
    if (!data.progress) return
    setProgressForm({
      studyHours: data.progress.studyHours,
      completedGoals: data.progress.completedGoals,
      currentStreak: data.progress.currentStreak,
      motivationLevel: data.progress.motivationLevel,
    })
  }, [data.progress])

  async function runAction(action: () => Promise<void>) {
    setLoading(true)
    setNotice(null)
    try {
      await action()
    } catch (error) {
      setNotice({ type: 'error', message: error instanceof Error ? error.message : 'No se pudo completar la accion.' })
    } finally {
      setLoading(false)
    }
  }

  async function saveAuthSession(authSession: Session) {
    await storeSession(authSession)
    setSession(authSession)
  }

  async function submitLogin() {
    await runAction(async () => {
      await saveAuthSession(await login(loginForm))
      setNotice({ type: 'ok', message: 'Sesion iniciada correctamente.' })
    })
  }

  async function submitRegister() {
    await runAction(async () => {
      await saveAuthSession(await register(registerForm))
      setNotice({ type: 'ok', message: 'Cuenta creada y sesion iniciada.' })
    })
  }

  async function logout() {
    await clearSession()
    setSession(null)
    setData(emptyWorkspace)
    setNotice(null)
  }

  async function savePlanner() {
    await runAction(async () => {
      await workspace.savePlanner(token, plannerForm)
      const planners = await workspace.getPlanners(token)
      setData((current) => ({ ...current, planners }))
      setNotice({ type: 'ok', message: 'Plan guardado correctamente.' })
    })
  }

  async function saveProgress() {
    await runAction(async () => {
      const progress = await workspace.saveProgress(token, progressForm)
      setData((current) => ({ ...current, progress }))
      setNotice({ type: 'ok', message: `Progreso actualizado. Racha actual: ${progress.currentStreak} dias.` })
    })
  }

  async function pickMaterialFile() {
    const result = await DocumentPicker.getDocumentAsync({
      copyToCacheDirectory: true,
      multiple: false,
      type: ['application/pdf', 'image/*', 'video/*'],
    })
    if (result.canceled) return
    const asset = result.assets[0]
    setSelectedFile({ uri: asset.uri, name: asset.name, mimeType: asset.mimeType })
  }

  async function createMaterial() {
    await runAction(async () => {
      if (!selectedFile) throw new Error('Selecciona un archivo para subirlo a Cloudinary.')
      const upload = await workspace.uploadMaterialFile(token, selectedFile)
      await workspace.createMaterial(token, { ...materialForm, fileUrl: upload.secureUrl })
      setMaterialForm(initialMaterial)
      setSelectedFile(null)
      setNotice({ type: 'ok', message: 'Material publicado correctamente.' })
      await loadWorkspace()
    })
  }

  async function generateRecommendation() {
    await runAction(async () => {
      const recommendation = await workspace.generateRecommendation(token)
      setData((current) => ({ ...current, recommendations: [recommendation, ...current.recommendations] }))
      setNotice({ type: 'ok', message: 'Recomendacion generada.' })
    })
  }

  async function askMentor() {
    await runAction(async () => {
      const answer = await workspace.askMentor(token, prompt)
      setMentorAnswer(answer.answer)
    })
  }

  if (booting) {
    return (
      <View style={styles.boot}>
        <ActivityIndicator />
        <Text style={styles.muted}>Cargando sesion...</Text>
      </View>
    )
  }

  if (!session) {
    return (
      <KeyboardAvoidingView style={styles.screen} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <StatusBar style="dark" />
        <ScrollView contentContainerStyle={styles.authContent}>
          <Text style={styles.brand}>Yuju StudyHub</Text>
          <Text style={styles.title}>{authMode === 'login' ? 'Iniciar sesion' : 'Crear cuenta'}</Text>
          <NoticeView notice={notice} />

          {authMode === 'register' && (
            <>
              <Input label="Nombre" value={registerForm.firstName} onChangeText={(firstName) => setRegisterForm((form) => ({ ...form, firstName }))} />
              <Input label="Apellido" value={registerForm.lastName} onChangeText={(lastName) => setRegisterForm((form) => ({ ...form, lastName }))} />
              <Input label="Usuario" value={registerForm.username} onChangeText={(username) => setRegisterForm((form) => ({ ...form, username }))} />
              <Input label="Edad" value={String(registerForm.age)} keyboardType="number-pad" onChangeText={(age) => setRegisterForm((form) => ({ ...form, age: Number(age) || 0 }))} />
            </>
          )}

          <Input label="Correo" value={authMode === 'login' ? loginForm.email : registerForm.email} autoCapitalize="none" keyboardType="email-address" onChangeText={(email) => authMode === 'login' ? setLoginForm((form) => ({ ...form, email })) : setRegisterForm((form) => ({ ...form, email }))} />
          <Input label="Contrasena" value={authMode === 'login' ? loginForm.password : registerForm.password} secureTextEntry onChangeText={(password) => authMode === 'login' ? setLoginForm((form) => ({ ...form, password })) : setRegisterForm((form) => ({ ...form, password }))} />

          <PrimaryButton label={authMode === 'login' ? 'Entrar' : 'Crear cuenta'} onPress={authMode === 'login' ? submitLogin : submitRegister} disabled={loading} />
          <Pressable style={styles.linkButton} onPress={() => setAuthMode(authMode === 'login' ? 'register' : 'login')}>
            <Text style={styles.linkText}>{authMode === 'login' ? 'No tengo cuenta' : 'Ya tengo cuenta'}</Text>
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>
    )
  }

  return (
    <View style={styles.screen}>
      <StatusBar style="dark" />
      <View style={styles.header}>
        <View>
          <Text style={styles.eyebrow}>Hola, {session.user.firstName || session.user.username}</Text>
          <Text style={styles.title}>Yuju Mobile</Text>
        </View>
        <Pressable style={styles.smallButton} onPress={logout}>
          <Text style={styles.smallButtonText}>Salir</Text>
        </Pressable>
      </View>

      <View style={styles.tabs}>
        {tabs.map((tab) => (
          <Pressable key={tab.key} style={[styles.tab, view === tab.key && styles.activeTab]} onPress={() => setView(tab.key)}>
            <Text style={[styles.tabText, view === tab.key && styles.activeTabText]}>{tab.label}</Text>
          </Pressable>
        ))}
      </View>

      <NoticeView notice={notice} />
      {loading && <ActivityIndicator style={styles.loader} />}

      <ScrollView contentContainerStyle={styles.content}>
        {view === 'inicio' && <HomeScreen data={data} onRefresh={loadWorkspace} />}
        {view === 'planes' && (
          <PlannerScreen
            plannerForm={plannerForm}
            setPlannerForm={setPlannerForm}
            progressForm={progressForm}
            setProgressForm={setProgressForm}
            planners={data.planners}
            progress={data.progress}
            onSavePlanner={savePlanner}
            onSaveProgress={saveProgress}
          />
        )}
        {view === 'materiales' && (
          <MaterialsScreen
            materials={data.materials}
            materialForm={materialForm}
            setMaterialForm={setMaterialForm}
            selectedFile={selectedFile}
            onPickFile={pickMaterialFile}
            onCreateMaterial={createMaterial}
          />
        )}
        {view === 'mentor' && (
          <MentorScreen
            recommendations={data.recommendations}
            prompt={prompt}
            setPrompt={setPrompt}
            answer={mentorAnswer}
            onAsk={askMentor}
            onGenerate={generateRecommendation}
          />
        )}
        {view === 'sensores' && <SensorsScreen />}
      </ScrollView>
    </View>
  )
}

function HomeScreen({ data, onRefresh }: { data: WorkspaceState; onRefresh: () => Promise<void> }) {
  const activePlan = data.planners[0]
  return (
    <View style={styles.stack}>
      <Card title="Resumen">
        <View style={styles.statsRow}>
          <Stat label="Planes" value={String(data.planners.length)} />
          <Stat label="Materiales" value={String(data.materials.length)} />
          <Stat label="Racha" value={`${data.progress?.currentStreak ?? 0}d`} />
        </View>
      </Card>
      <Card title="Plan activo">
        <Text style={styles.body}>{activePlan?.weeklyGoal ?? 'Aun no tienes un plan activo.'}</Text>
        {activePlan && <Text style={styles.muted}>{activePlan.startDate} al {activePlan.endDate} - {activePlan.targetHours} horas</Text>}
      </Card>
      <PrimaryButton label="Actualizar datos" onPress={onRefresh} />
    </View>
  )
}

function PlannerScreen(props: {
  plannerForm: PlannerForm
  setPlannerForm: React.Dispatch<React.SetStateAction<PlannerForm>>
  progressForm: ProgressForm
  setProgressForm: React.Dispatch<React.SetStateAction<ProgressForm>>
  planners: Planner[]
  progress: Progress | null
  onSavePlanner: () => Promise<void>
  onSaveProgress: () => Promise<void>
}) {
  return (
    <View style={styles.stack}>
      <Card title="Nuevo plan">
        <Input label="Meta semanal" value={props.plannerForm.weeklyGoal} onChangeText={(weeklyGoal) => props.setPlannerForm((form) => ({ ...form, weeklyGoal }))} />
        <Input label="Horas objetivo" value={String(props.plannerForm.targetHours)} keyboardType="number-pad" onChangeText={(value) => props.setPlannerForm((form) => ({ ...form, targetHours: Number(value) || 0 }))} />
        <Input label="Inicio YYYY-MM-DD" value={props.plannerForm.startDate} onChangeText={(startDate) => props.setPlannerForm((form) => ({ ...form, startDate }))} />
        <Input label="Fin YYYY-MM-DD" value={props.plannerForm.endDate} onChangeText={(endDate) => props.setPlannerForm((form) => ({ ...form, endDate }))} />
        <PrimaryButton label="Guardar plan" onPress={props.onSavePlanner} />
      </Card>

      <Card title="Progreso">
        <View style={styles.statsRow}>
          <Stat label="Horas" value={String(props.progress?.studyHours ?? 0)} />
          <Stat label="Metas" value={String(props.progress?.completedGoals ?? 0)} />
          <Stat label="Racha" value={`${props.progress?.currentStreak ?? 0}d`} />
        </View>
        <Input label="Horas estudiadas" value={String(props.progressForm.studyHours)} keyboardType="number-pad" onChangeText={(value) => props.setProgressForm((form) => ({ ...form, studyHours: Number(value) || 0 }))} />
        <Input label="Metas completadas" value={String(props.progressForm.completedGoals)} keyboardType="number-pad" onChangeText={(value) => props.setProgressForm((form) => ({ ...form, completedGoals: Number(value) || 0 }))} />
        <Input label="Racha actual" value={String(props.progressForm.currentStreak)} keyboardType="number-pad" onChangeText={(value) => props.setProgressForm((form) => ({ ...form, currentStreak: Number(value) || 0 }))} />
        <Input label="Motivacion 1-10" value={String(props.progressForm.motivationLevel)} keyboardType="number-pad" onChangeText={(value) => props.setProgressForm((form) => ({ ...form, motivationLevel: Number(value) || 0 }))} />
        <PrimaryButton label="Guardar progreso" onPress={props.onSaveProgress} />
      </Card>

      <Card title="Planes guardados">
        {props.planners.length === 0 ? <Text style={styles.muted}>No hay planes guardados.</Text> : props.planners.map((planner) => (
          <View key={planner.id} style={styles.listItem}>
            <Text style={styles.itemTitle}>{planner.weeklyGoal}</Text>
            <Text style={styles.muted}>{planner.startDate} al {planner.endDate} - {planner.priority}</Text>
          </View>
        ))}
      </Card>
    </View>
  )
}

function MaterialsScreen(props: {
  materials: Material[]
  materialForm: MaterialForm
  setMaterialForm: React.Dispatch<React.SetStateAction<MaterialForm>>
  selectedFile: workspace.LocalUploadFile | null
  onPickFile: () => Promise<void>
  onCreateMaterial: () => Promise<void>
}) {
  function setPrice(value: string) {
    const normalized = value.replace(',', '.')
    props.setMaterialForm((form) => ({ ...form, price: Number(normalized) || 0 }))
  }

  return (
    <View style={styles.stack}>
      <Card title="Publicar material">
        <Input label="Titulo" value={props.materialForm.title} onChangeText={(title) => props.setMaterialForm((form) => ({ ...form, title }))} />
        <Input label="Descripcion" value={props.materialForm.description} multiline onChangeText={(description) => props.setMaterialForm((form) => ({ ...form, description }))} />
        <Input label="Categoria" value={props.materialForm.category} onChangeText={(category) => props.setMaterialForm((form) => ({ ...form, category }))} />
        <Input label="Precio" value={String(props.materialForm.price)} keyboardType="decimal-pad" onChangeText={setPrice} />
        <SecondaryButton label={props.selectedFile ? 'Cambiar archivo' : 'Seleccionar archivo'} onPress={props.onPickFile} />
        {props.selectedFile && <Text style={styles.muted}>{props.selectedFile.name}</Text>}
        <PrimaryButton label="Subir y publicar" onPress={props.onCreateMaterial} />
      </Card>

      <Card title="Mis materiales">
        {props.materials.length === 0 ? <Text style={styles.muted}>Todavia no hay materiales.</Text> : props.materials.map((material) => (
          <View key={material.id} style={styles.listItem}>
            <Text style={styles.itemTitle}>{material.title}</Text>
            <Text style={styles.muted}>{material.category} - S/ {material.price}</Text>
          </View>
        ))}
      </Card>
    </View>
  )
}

function MentorScreen(props: {
  recommendations: Recommendation[]
  prompt: string
  setPrompt: React.Dispatch<React.SetStateAction<string>>
  answer: string
  onAsk: () => Promise<void>
  onGenerate: () => Promise<void>
}) {
  return (
    <View style={styles.stack}>
      <Card title="Mentor IA">
        <Input label="Pregunta" value={props.prompt} multiline onChangeText={props.setPrompt} />
        <PrimaryButton label="Preguntar" onPress={props.onAsk} />
        <SecondaryButton label="Generar recomendacion" onPress={props.onGenerate} />
        {props.answer ? <Text style={styles.answer}>{props.answer}</Text> : null}
      </Card>
      <Card title="Recomendaciones">
        {props.recommendations.length === 0 ? <Text style={styles.muted}>Sin recomendaciones todavia.</Text> : props.recommendations.map((item) => (
          <View key={item.id} style={styles.listItem}>
            <Text style={styles.itemTitle}>{item.recommendationType}</Text>
            <Text style={styles.body}>{item.content}</Text>
          </View>
        ))}
      </Card>
    </View>
  )
}

function SensorsScreen() {
  const cameraRef = useRef<CameraView>(null)
  const [cameraPermission, requestCameraPermission] = useCameraPermissions()
  const [photo, setPhoto] = useState<CameraCapturedPicture | null>(null)
  const [facing, setFacing] = useState<'front' | 'back'>('back')
  const recorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY)
  const recorderState = useAudioRecorderState(recorder)
  const [audioUri, setAudioUri] = useState<string | null>(null)

  async function takePhoto() {
    if (!cameraPermission?.granted) {
      const response = await requestCameraPermission()
      if (!response.granted) return
    }
    const picture = await cameraRef.current?.takePictureAsync({ quality: 0.8 })
    if (picture) setPhoto(picture)
  }

  async function startRecording() {
    const permission = await requestRecordingPermissionsAsync()
    if (!permission.granted) return
    await setAudioModeAsync({ allowsRecording: true, playsInSilentMode: true })
    await recorder.prepareToRecordAsync()
    recorder.record()
  }

  async function stopRecording() {
    await recorder.stop()
    setAudioUri(recorder.getStatus().url)
    await setAudioModeAsync({ allowsRecording: false, playsInSilentMode: true })
  }

  return (
    <View style={styles.stack}>
      <Card title="Camara">
        {cameraPermission?.granted ? (
          <CameraView ref={cameraRef} style={styles.camera} facing={facing} />
        ) : (
          <View style={styles.sensorPlaceholder}>
            <Text style={styles.muted}>Activa el permiso de camara para probar el sensor.</Text>
          </View>
        )}
        <View style={styles.row}>
          <SecondaryButton label="Permiso" onPress={async () => { await requestCameraPermission() }} />
          <SecondaryButton label={facing === 'back' ? 'Frontal' : 'Trasera'} onPress={() => setFacing((current) => current === 'back' ? 'front' : 'back')} />
        </View>
        <PrimaryButton label="Tomar foto" onPress={takePhoto} />
        {photo && <Image source={{ uri: photo.uri }} style={styles.preview} />}
      </Card>

      <Card title="Audio">
        <Text style={styles.body}>Estado: {recorderState.isRecording ? 'grabando' : 'detenido'} - {Math.round(recorderState.durationMillis / 1000)}s</Text>
        <PrimaryButton label={recorderState.isRecording ? 'Detener grabacion' : 'Iniciar grabacion'} onPress={recorderState.isRecording ? stopRecording : startRecording} />
        {audioUri && <Text style={styles.muted}>Audio guardado localmente: {audioUri}</Text>}
      </Card>
    </View>
  )
}

function NoticeView({ notice }: { notice: Notice }) {
  if (!notice) return null
  return (
    <View style={[styles.notice, notice.type === 'error' ? styles.noticeError : styles.noticeOk]}>
      <Text style={styles.noticeText}>{notice.message}</Text>
    </View>
  )
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View style={styles.card}>
      <Text style={styles.cardTitle}>{title}</Text>
      {children}
    </View>
  )
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.stat}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  )
}

function Input(props: React.ComponentProps<typeof TextInput> & { label: string }) {
  const { label, style, ...inputProps } = props
  return (
    <View style={styles.inputGroup}>
      <Text style={styles.label}>{label}</Text>
      <TextInput placeholderTextColor="#7b8494" style={[styles.input, props.multiline && styles.textarea, style]} {...inputProps} />
    </View>
  )
}

function PrimaryButton({ label, onPress, disabled }: { label: string; onPress: () => void | Promise<void>; disabled?: boolean }) {
  return (
    <Pressable style={[styles.primaryButton, disabled && styles.disabled]} onPress={onPress} disabled={disabled}>
      <Text style={styles.primaryButtonText}>{label}</Text>
    </Pressable>
  )
}

function SecondaryButton({ label, onPress }: { label: string; onPress: () => void | Promise<void> }) {
  return (
    <Pressable style={styles.secondaryButton} onPress={onPress}>
      <Text style={styles.secondaryButtonText}>{label}</Text>
    </Pressable>
  )
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#f5f7fb',
    paddingTop: 48,
  },
  boot: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    backgroundColor: '#f5f7fb',
  },
  authContent: {
    padding: 24,
    gap: 14,
  },
  header: {
    paddingHorizontal: 18,
    paddingBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  brand: {
    color: '#184f49',
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 22,
  },
  eyebrow: {
    color: '#607080',
    fontSize: 13,
    fontWeight: '700',
  },
  title: {
    color: '#18202b',
    fontSize: 28,
    fontWeight: '800',
  },
  tabs: {
    paddingHorizontal: 12,
    paddingBottom: 10,
    flexDirection: 'row',
    gap: 8,
  },
  tab: {
    flex: 1,
    minHeight: 38,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#e7edf3',
  },
  activeTab: {
    backgroundColor: '#1f7a68',
  },
  tabText: {
    color: '#465564',
    fontSize: 11,
    fontWeight: '700',
  },
  activeTabText: {
    color: '#ffffff',
  },
  content: {
    padding: 16,
    paddingBottom: 42,
  },
  stack: {
    gap: 14,
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 8,
    padding: 16,
    gap: 12,
    borderWidth: 1,
    borderColor: '#e4e9ef',
  },
  cardTitle: {
    color: '#18202b',
    fontSize: 18,
    fontWeight: '800',
  },
  body: {
    color: '#27313d',
    fontSize: 14,
    lineHeight: 20,
  },
  muted: {
    color: '#677586',
    fontSize: 13,
    lineHeight: 19,
  },
  answer: {
    color: '#18202b',
    backgroundColor: '#eef8f5',
    borderRadius: 8,
    padding: 12,
    lineHeight: 20,
  },
  inputGroup: {
    gap: 6,
  },
  label: {
    color: '#394756',
    fontWeight: '700',
    fontSize: 13,
  },
  input: {
    minHeight: 46,
    borderWidth: 1,
    borderColor: '#ccd6df',
    borderRadius: 8,
    backgroundColor: '#ffffff',
    color: '#18202b',
    paddingHorizontal: 12,
    fontSize: 15,
  },
  textarea: {
    minHeight: 88,
    paddingTop: 12,
    textAlignVertical: 'top',
  },
  primaryButton: {
    minHeight: 46,
    borderRadius: 8,
    backgroundColor: '#1f7a68',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 14,
  },
  primaryButtonText: {
    color: '#ffffff',
    fontWeight: '800',
  },
  secondaryButton: {
    minHeight: 44,
    borderRadius: 8,
    backgroundColor: '#e9f2ef',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 14,
  },
  secondaryButtonText: {
    color: '#1f6759',
    fontWeight: '800',
  },
  smallButton: {
    minHeight: 36,
    borderRadius: 8,
    paddingHorizontal: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#e7edf3',
  },
  smallButtonText: {
    color: '#344250',
    fontWeight: '800',
  },
  linkButton: {
    alignItems: 'center',
    padding: 8,
  },
  linkText: {
    color: '#1f6759',
    fontWeight: '800',
  },
  disabled: {
    opacity: 0.55,
  },
  notice: {
    marginHorizontal: 16,
    marginBottom: 8,
    borderRadius: 8,
    padding: 12,
  },
  noticeOk: {
    backgroundColor: '#e7f6ee',
  },
  noticeError: {
    backgroundColor: '#fdeaea',
  },
  noticeText: {
    color: '#27313d',
    fontWeight: '700',
  },
  loader: {
    marginVertical: 6,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  stat: {
    flex: 1,
    borderRadius: 8,
    padding: 12,
    backgroundColor: '#f1f5f8',
  },
  statValue: {
    color: '#18202b',
    fontSize: 20,
    fontWeight: '800',
  },
  statLabel: {
    color: '#677586',
    fontSize: 12,
    fontWeight: '700',
  },
  listItem: {
    borderTopWidth: 1,
    borderTopColor: '#edf1f5',
    paddingTop: 10,
    gap: 4,
  },
  itemTitle: {
    color: '#18202b',
    fontWeight: '800',
  },
  row: {
    flexDirection: 'row',
    gap: 10,
  },
  camera: {
    height: 260,
    borderRadius: 8,
    overflow: 'hidden',
  },
  sensorPlaceholder: {
    height: 180,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ccd6df',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  preview: {
    height: 180,
    borderRadius: 8,
  },
})
