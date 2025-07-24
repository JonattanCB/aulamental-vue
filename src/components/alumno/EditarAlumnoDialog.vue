<script setup>
import { editarAlumno, getAlumnoById } from '@/service/AlumnoService';
import { useToast } from 'primevue/usetoast';
import { computed, defineEmits, defineProps, ref, watch } from 'vue';

const toast = useToast();

const props = defineProps({
    visible: Boolean,
    idUsuario: Number
});
const emit = defineEmits(['update:visible', 'save']);

function cerrarDialogo() {
    emit('update:visible', false);
}

const alumno = ref(null);
const apoderados = ref([]);
const cargando = ref(false);
const activeStep = ref(0);
const steps = [{ label: 'Datos del Alumno' }, { label: 'Datos del Padre' }];

const pasoActual = computed(() => `Paso ${activeStep.value + 1} de ${steps.length}: ${steps[activeStep.value].label}`);

function siguientePaso() {
    if (!tipoSeccion.value || !gradoSeleccionado.value) {
        toast.add({
            severity: 'warn',
            summary: 'Datos incompletos',
            detail: 'Debe seleccionar la sección y el grado del alumno.',
            life: 3000
        });
        return;
    }
    activeStep.value++;
}

const tiposSeccion = [
    { label: 'INICIAL', value: 'INICIAL' },
    { label: 'PRIMARIA', value: 'PRIMARIA' },
    { label: 'SECUNDARIA', value: 'SECUNDARIA' }
];

const grados = computed(() => {
    if (tipoSeccion.value === 'INICIAL') return [3, 4, 5];
    if (tipoSeccion.value === 'PRIMARIA') return [1, 2, 3, 4, 5, 6];
    if (tipoSeccion.value === 'SECUNDARIA') return [1, 2, 3, 4, 5];
    return [];
});

const tipoSeccion = ref(null);
const gradoSeleccionado = ref(null);

function pasoAnterior() {
    if (activeStep.value > 0) activeStep.value--;
}

watch(
    () => props.visible,
    async (open) => {
        if (open && props.idUsuario) {
            cargando.value = true;
            try {
                const data = await getAlumnoById(props.idUsuario);
                alumno.value = data;
                tipoSeccion.value = data.nivel;
                gradoSeleccionado.value = data.gradoselec;
                apoderados.value = data.apoderadoDtos || [];
                activeStep.value = 0;
            } catch (error) {
                console.error('Error al cargar alumno:', error);
            } finally {
                cargando.value = false;
            }
        }
    }
);

watch(tipoSeccion, () => {
    if (cargando.value) return;

    const gradosValidos = grados.value;
    if (!gradosValidos.includes(gradoSeleccionado.value)) {
        gradoSeleccionado.value = null;
    }
});

async function guardarCambios() {
    try {
        const payload = {
            idAlumno: props.idUsuario,
            grado: gradoSeleccionado.value,
            nivel: tipoSeccion.value,
            apoderados: apoderados.value.map((apo) => ({
                idAPoderado: apo.id,
                telefono: apo.telefono,
                telefono1: apo.contactoAlternativo,
                opcipacion: apo.ocupacion,
                direccion: apo.direccion
            }))
        };

        await editarAlumno(payload);
        toast.add({
            severity: 'success',
            summary: 'Alumno actualizado',
            detail: 'Los datos del alumno fueron actualizados correctamente.',
            life: 3000
        });
        emit('save');
        cerrarDialogo();
    } catch (error) {
        toast.add({
            severity: 'error',
            summary: 'Error',
            detail: 'No se pudo actualizar el alumno.',
            life: 3000
        });
    }
}
</script>

<template>
    <Dialog
        v-model:visible="props.visible"
        @update:visible="(val) => emit('update:visible', val)"
        modal
        class="modal-personalizado"
        :style="{ maxWidth: '55rem', width: '90vw' }"
        :breakpoints="{
            '1199px': '75vw',
            '991px': '85vw',
            '767px': '95vw',
            '575px': '98vw'
        }"
    >
        <template #header>
            <div class="diseño-header-modal">
                <div class="flex align-items-center justify-content-center" style="display: flex; align-items: center">
                    <div class="card-border-icon-visualizacion diseño-icon-modal-visualizacion">
                        <i class="bi bi-person" style="font-size: 2rem"></i>
                    </div>
                    <div class="flex flex-col gap-1" style="margin-left: 1rem">
                        <span class="font-semibold text-xl text-gray-900 dark:text-surface-0">Editar datos del Estudiante</span>
                        <div class="flex items-center gap-2">
                            <span class="text-sm text-gray-600 dark:text-surface-0">Detalles completos del estudiante y sus apoderados</span>
                        </div>
                    </div>
                </div>
            </div>
        </template>

        <Steps :model="steps" :activeStep="activeStep" class="mb-4" />
        <div class="p-4">
            <div class="contenedor-modal" v-if="activeStep === 0">
                <div class="grid border rounded-lg p-5 bg-white dark:bg-gray-800">
                    <h3 class="text-lg font-semibold text-gray-800 dark:text-white mb-4">Datos del Alumno</h3>
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <!-- Nombre Completo -->
                        <div class="flex flex-col">
                            <div class="mb-3">
                                <strong class="text-gray-700 dark:text-gray-300">Nombre del Alumno:</strong>
                                <p class="text-gray-800 dark:text-gray-100 mt-1">{{ alumno?.nombre }}</p>
                            </div>
                        </div>

                        <!-- Edad -->
                        <div class="flex flex-col">
                            <div class="mb-3">
                                <strong class="text-gray-700 dark:text-gray-300">Edad del Alumno:</strong>
                                <p class="text-gray-800 dark:text-gray-100 mt-1">{{ alumno?.edad }} años</p>
                            </div>
                        </div>

                        <!-- Seccion -->
                        <div class="flex flex-col">
                            <div class="mb-3">
                                <strong class="text-gray-700 dark:text-gray-300">Seccion:</strong>
                                <Select v-model="tipoSeccion" :options="tiposSeccion" optionLabel="label" optionValue="value" placeholder="Seleccione una seccion" class="w-full" />
                            </div>
                        </div>

                        <!-- Grado -->
                        <div class="flex flex-col">
                            <div class="mb-3">
                                <strong class="text-gray-700 dark:text-gray-300">Grado:</strong>
                                <Select v-model="gradoSeleccionado" :options="grados" :disabled="!tipoSeccion" placeholder="Seleccione el grado" class="w-full" />
                            </div>
                        </div>
                    </div>
                </div>

                <div class="bg-white dark:bg-surface-900 p-5 rounded-lg shadow border border-gray-200 dark:border-surface-700" style="margin-top: 1rem">
                    <h3 class="text-lg font-semibold text-gray-800 dark:text-white mb-4">Contacto de Emergencia</h3>
                    <div class="mb-4">
                        <p class="font-semibold text-gray-800 dark:text-white">Telefono Apoderado:</p>
                        <div class="mt-1 bg-blue-50 dark:bg-surface-700 text-gray-700 dark:text-surface-100 rounded px-4 py-2 text-justify text-sm sm:text-base leading-relaxed">
                            {{ alumno?.apotelefono }}
                        </div>
                    </div>
                    <div class="mb-4">
                        <p class="font-semibold text-gray-800 dark:text-white">Direccion:</p>
                        <div class="mt-1 bg-green-50 dark:bg-green-900 text-green-800 dark:text-green-100 border-l-4 border-green-500 rounded px-4 py-2 text-justify text-sm sm:text-base leading-relaxed">
                            {{ alumno?.direccion }}
                        </div>
                    </div>
                </div>
            </div>
            <div v-else-if="activeStep === 1">
                <div v-if="apoderados.length === 0" class="p-4 text-center text-gray-500 dark:text-gray-400">Sin apoderados registrados.</div>
                <div v-else class="flex flex-col gap-6">
                    <div v-for="(apo, index) in apoderados" :key="index" class="border rounded-lg overflow-hidden bg-white dark:bg-surface-800">
                        <!-- Encabezado con parentesco -->
                        <div class="flex items-center gap-2 px-4 py-3 bg-blue-600 dark:bg-blue-500">
                            <i class="pi pi-user text-white"></i>
                            <span class="text-white font-semibold">{{ apo.parentesco || 'APODERADO' }}</span>
                        </div>

                        <!-- Cuerpo con los campos -->
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 p-5 bg-white dark:bg-gray-800">
                            <!-- Nombre Completo -->
                            <div class="flex flex-col">
                                <label class="text-sm text-gray-500 dark:text-gray-400 mb-1">Nombre Completo:</label>
                                <div class="rounded-lg bg-gray-50 dark:bg-surface-700 p-3 font-semibold text-gray-800 dark:text-gray-100">
                                    {{ apo.nombre || 'Sin datos' }}
                                </div>
                            </div>

                            <!-- Correo Electrónico -->
                            <div class="flex flex-col">
                                <label class="text-sm text-gray-500 dark:text-gray-400 mb-1">Correo Electrónico:</label>
                                <div class="rounded-lg bg-gray-50 dark:bg-surface-700 p-3 font-semibold text-gray-800 dark:text-gray-100">
                                    {{ apo.correo || 'Sin datos' }}
                                </div>
                            </div>

                            <!-- Teléfono -->
                            <div class="flex flex-col">
                                <label class="text-sm text-gray-500 dark:text-gray-400 mb-1">Teléfono:</label>
                                <InputText id="lnacimiento" v-model="apo.telefono" :maxlength="9" type="text" class="w-full" />
                            </div>

                            <!-- Ocupación -->
                            <div class="flex flex-col">
                                <label class="text-sm text-gray-500 dark:text-gray-400 mb-1">Ocupación:</label>
                                <InputText id="lnacimiento" v-model="apo.ocupacion" type="text" class="w-full" />
                            </div>

                            <!-- Contacto Alternativo -->
                            <div class="flex flex-col">
                                <label class="text-sm text-gray-500 dark:text-gray-400 mb-1">Contacto Alternativo:</label>
                                <InputText id="lnacimiento" v-model="apo.contactoAlternativo" :maxlength="9" type="text" class="w-full" />
                            </div>

                            <!-- Dirección -->
                            <div class="flex flex-col">
                                <label class="text-sm text-gray-500 dark:text-gray-400 mb-1">Dirección:</label>
                                <InputText id="lnacimiento" v-model="apo.direccion" type="text" class="w-full" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <template #footer>
            <Button label="Cerrar" text @click="cerrarDialogo" />
            <Button label="Anterior" text @click="pasoAnterior" :disabled="activeStep === 0" />
            <Button v-if="activeStep < steps.length - 1" label="Siguiente" text @click="siguientePaso" />
            <Button v-else label="Guardar" @click="guardarCambios" icon="pi pi-check" />
        </template>
    </Dialog>
</template>
