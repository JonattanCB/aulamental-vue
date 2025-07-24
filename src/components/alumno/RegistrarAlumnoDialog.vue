<script setup>
import { usePersona } from '@/composables/useUsuario/usePersona';
import { crearAlumno } from '@/service/AlumnoService';
import { Column } from 'primevue';
import { useToast } from 'primevue/usetoast';
import { computed, defineEmits, defineProps, ref, watch } from 'vue';

const toast = useToast();

/* ───── props/emit ───── */
const props = defineProps({ visible: Boolean });
const emit = defineEmits(['update:visible', 'save']);
const { persona, buscarPersona } = usePersona();

function cerrarDialogo() {
    resetFormulario();
    emit('update:visible', false);
}

/* ───── steps ───── */
const activeStep = ref(0);

const steps = [{ label: 'Datos del Alumno' }, { label: 'Datos del Padre' }];

const pasoActual = computed(() => `Paso ${activeStep.value + 1} de ${steps.length}: ${steps[activeStep.value].label}`);

const listaApoderados = ref([]);

/* ───── navegación ───── */

function esCorreoValido(correo) {
    return correo && correo.includes('@');
}

function siguientePaso() {
    if (
        !tipoSeleccionado.value ||
        !ndocumento.value ||
        !nombre.value ||
        !apaterno.value ||
        !amaterno.value ||
        !lnacimiento.value ||
        !fechaNacimiento.value ||
        !telefono1.value ||
        !correopersonal.value ||
        !direccion.value ||
        !tipoSeccion.value ||
        !gradoSeleccionado.value
    ) {
        toast.add({
            severity: 'warn',
            summary: 'Campos incompletos',
            detail: 'Por favor, complete todos los campos obligatorios antes de continuar.',
            life: 3000
        });
        return;
    }

    activeStep.value++;
}

function pasoAnterior() {
    if (activeStep.value > 0) activeStep.value--;
}

/* ───── Datos personales ───── */
const tiposDocumento = [
    { label: 'DNI', value: 'DNI' },
    { label: 'PASAPORTE', value: 'PASAPORTE' }
];

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

const gradoSeleccionado = ref(null);

const tipoSeleccionado = ref(null);
const tipoSeccion = ref(null);
const fechaNacimiento = ref(null);
const nombre = ref('');
const apaterno = ref('');
const amaterno = ref('');
const ndocumento = ref('');
const telefono1 = ref('');
const telefono2 = ref('');
const correopersonal = ref('');
const direccion = ref('');
const lnacimiento = ref('');

const mostrarModalSecundario = ref(false);

/* ─── controles de documento ─── */
const ndocumentoMaxlength = computed(() => {
    if (tipoSeleccionado.value === 'DNI') return 8;
    if (tipoSeleccionado.value === 'PASAPORTE') return 12;
    return null;
});

// bloqueado hasta elegir tipo
const ndocumentoDisabled = computed(() => !tipoSeleccionado.value);

// solo activo con DNI
const searchDisabled = computed(() => tipoSeleccionado.value !== 'DNI');

// limpia Nº doc al cambiar tipo
watch(tipoSeleccionado, () => {
    ndocumento.value = '';
});

// evita que supere el límite
watch(ndocumento, (val) => {
    const max = ndocumentoMaxlength.value;
    if (max && val.length > max) ndocumento.value = val.slice(0, max);
});

const camposNombreDeshabilitados = computed(() => tipoSeleccionado.value === 'DNI');

/* ────  resetFormulario ─────*/

function resetFormulario() {
    activeStep.value = 0;
}

function cerrarModalSecundario() {
    mostrarModalSecundario.value = false;
    limpiarFormularioApoderado();
}

function abrirModalSecundario() {
    mostrarModalSecundario.value = true;
}

watch(
    () => props.visible,
    (val) => {
        if (val) {
            resetFormulario();
        }
    }
);

watch(tipoSeccion, () => {
    gradoSeleccionado.value = null;
});
/* ───── Envío API ───── */

async function onBuscarDni() {
    if (ndocumento.value.length !== 8) {
        toast.add({
            severity: 'warn',
            summary: 'DNI inválido',
            detail: 'Debe tener 8 dígitos.',
            life: 3000
        });
        return;
    }

    try {
        const data = await buscarPersona(ndocumento.value);
        nombre.value = data.nombres ?? '';
        apaterno.value = data.apellidoPaterno ?? '';
        amaterno.value = data.apellidoMaterno ?? '';
        tipoSeleccionado.value = 'DNI';
    } catch {}
}

async function onBuscarDniApo() {
    if (apoNdocumento.value.length !== 8) {
        toast.add({
            severity: 'warn',
            summary: 'DNI inválido',
            detail: 'Debe tener 8 dígitos.',
            life: 3000
        });
        return;
    }

    try {
        const data = await buscarPersona(apoNdocumento.value);
        apoNombre.value = data.nombres ?? '';
        apoApaterno.value = data.apellidoPaterno ?? '';
        apoAmaterno.value = data.apellidoMaterno ?? '';
        apoTipoSeleccionado.value = 'DNI';
    } catch {}
}

/*  - apoderado -   */
const apoTipoSeleccionado = ref(null);
const apoNdocumento = ref('');
const apoNombre = ref('');
const apoApaterno = ref('');
const apoAmaterno = ref('');
const apoLnacimiento = ref('');
const apoFechaNacimiento = ref(null);
const apoTelefono1 = ref('');
const apoTelefono2 = ref('');
const apoCorreopersonal = ref('');
const apoDireccion = ref('');
const apoOcupacion = ref('');
const apoParentesco = ref(null);
const apoConvive = ref(null);

const opcionesParentesco = [
    { label: 'PADRE', value: 'PADRE' },
    { label: 'MADRE', value: 'MADRE' },
    { label: 'APODERADO', value: 'APODERADO' }
];

const opcionesConvive = [
    { label: 'SÍ', value: 'SI' },
    { label: 'NO', value: 'NO' }
];

const apoDocumentoMaxlength = computed(() => {
    if (apoTipoSeleccionado.value === 'DNI') return 8;
    if (apoTipoSeleccionado.value === 'PASAPORTE') return 12;
    return null;
});

const apoDocumentoDisabled = computed(() => !apoTipoSeleccionado.value);
const apoSearchDisabled = computed(() => apoTipoSeleccionado.value !== 'DNI');
const apoCamposNombreDeshabilitados = computed(() => apoTipoSeleccionado.value === 'DNI');

function guardarApoderado() {
    if (
        !apoTipoSeleccionado.value ||
        !apoNdocumento.value ||
        !apoNombre.value ||
        !apoApaterno.value ||
        !apoAmaterno.value ||
        !apoLnacimiento.value ||
        !apoFechaNacimiento.value ||
        !apoTelefono1.value ||
        !apoCorreopersonal.value ||
        !apoDireccion.value ||
        !apoParentesco.value ||
        !apoConvive.value ||
        !apoOcupacion.value
    ) {
        toast.add({
            severity: 'warn',
            summary: 'Campos incompletos',
            detail: 'Por favor, complete todos los campos del apoderado.',
            life: 3000
        });
        return;
    }

    const apoderado = {
        tipoDocumento: apoTipoSeleccionado.value,
        numeroDocumento: apoNdocumento.value,
        nombres: apoNombre.value,
        apellidoPaterno: apoApaterno.value,
        apellidoMaterno: apoAmaterno.value,
        lugarNacimiento: apoLnacimiento.value,
        fechaNacimiento: apoFechaNacimiento.value,
        telefono1: apoTelefono1.value,
        telefono2: apoTelefono2.value,
        correo: apoCorreopersonal.value,
        direccion: apoDireccion.value,
        ocupacion: apoOcupacion.value,
        parentesco: apoParentesco.value,
        convive: apoConvive.value
    };

    listaApoderados.value.push(apoderado);

    limpiarFormularioApoderado();
    cerrarModalSecundario();
}

function limpiarFormularioApoderado() {
    apoTipoSeleccionado.value = null;
    apoNdocumento.value = '';
    apoNombre.value = '';
    apoApaterno.value = '';
    apoAmaterno.value = '';
    apoLnacimiento.value = '';
    apoFechaNacimiento.value = null;
    apoTelefono1.value = '';
    apoTelefono2.value = '';
    apoCorreopersonal.value = '';
    apoDireccion.value = '';
    apoParentesco.value = null;
    apoConvive.value = null;
    apoOcupacion.value = '';
}

function eliminarApoderado(index) {
    listaApoderados.value.splice(index, 1);
}

/* --- Guardar Alumno---  */
async function guardarUsuario() {
    if (listaApoderados.value.length === 0) {
        toast.add({
            severity: 'warn',
            summary: 'Sin apoderados',
            detail: 'Debes agregar al menos un apoderado antes de guardar.',
            life: 3000
        });
        return;
    }

    const payload = {
        nombre: nombre.value,
        apaterno: apaterno.value,
        amaterno: amaterno.value,
        tdocumento: tipoSeleccionado.value,
        ndocumento: ndocumento.value,
        telefono1: telefono1.value,
        telefono2: telefono2.value,
        correopersonal: correopersonal.value,
        direccion: direccion.value,
        lnacimiento: lnacimiento.value,
        fnacimiento: fechaNacimiento.value?.toISOString().split('T')[0],
        nivel: tipoSeccion.value,
        grado: gradoSeleccionado.value,
        apoderados: listaApoderados.value.map((a) => ({
            nombre: a.nombres,
            apaterno: a.apellidoPaterno,
            amaterno: a.apellidoMaterno,
            tdocumento: a.tipoDocumento,
            ndocumento: a.numeroDocumento,
            telefono1: a.telefono1,
            telefono2: a.telefono2,
            correopersonal: a.correo,
            direccion: a.direccion,
            lnacimiento: a.lugarNacimiento,
            fnacimiento: a.fechaNacimiento?.toISOString().split('T')[0],
            ocupacion: a.ocupacion,
            parentesco: a.parentesco,
            convive: a.convive
        }))
    };

    try {
        await crearAlumno(payload);
        toast.add({
            severity: 'success',
            summary: 'Registro exitoso',
            detail: 'Alumno registrado correctamente.',
            life: 3000
        });
        emit('save');
        cerrarDialogo();
    } catch (error) {
        toast.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Hubo un problema al registrar el alumno.',
            life: 4000
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
        :style="{ maxWidth: '80rem', width: '90vw' }"
        :breakpoints="{
            '1199px': '75vw',
            '991px': '85vw',
            '767px': '95vw',
            '575px': '98vw'
        }"
    >
        <!-- encabezado -->
        <template #header>
            <div class="flex flex-col">
                <span class="titulo-registrar">Registrar Nuevo Alumno</span>
                <span class="titulo-registrar-cantida-usuario">{{ pasoActual }}</span>
            </div>
        </template>

        <!-- steps -->
        <Steps :model="steps" :activeStep="activeStep" class="mb-4" />
        <div class="p-4">
            <div class="contenedor-modal" v-if="activeStep === 0" style="margin-bottom: 17rem">
                <!-- Informacion-->
                <div class="card-border-info dp">
                    <div class="flex align-items-center justify-content-center">
                        <div class="card-border-info-icon info">
                            <i class="pi pi-user" style="font-size: 1.4rem" />
                        </div>
                        <div style="margin-left: 1rem">
                            <h3 class="m-0 text-lg font-semibold" style="color: #fff; font-size: 1.5rem">Datos Personales</h3>
                            <p class="m-0 text-sm opacity-90" style="color: #fff">Complete la información del alumno</p>
                        </div>
                    </div>
                </div>
                <!-- Identificacion-->
                <div class="card-border">
                    <div class="flex align-items-center justify-content-center">
                        <div class="card-border-icon info2">
                            <i class="bi bi-person-vcard" style="font-size: 1.4rem" />
                        </div>
                        <span class="card-border-icon-text">Identificacion</span>
                    </div>
                    <div class="flex flex-col md:flex-row gap-4" style="margin-top: 1.5rem">
                        <!-- Tipo de Documento -->
                        <div class="flex flex-col w-full md:w-1/2">
                            <label class="mb-2" for="tipoDoc">Tipo de Documento</label>
                            <Select v-model="tipoSeleccionado" :options="tiposDocumento" optionLabel="label" optionValue="value" placeholder="Seleccione un documento" class="w-full" />
                        </div>
                        <!-- Número de Documento -->
                        <div class="flex flex-col w-full md:w-1/2">
                            <label class="mb-2" for="numeroDoc">Número de Documento</label>
                            <div>
                                <InputText placeholder="Ej: 12345678" style="width: 84%; margin-right: 0.5rem" v-model="ndocumento" :disabled="ndocumentoDisabled" :maxlength="ndocumentoMaxlength" />
                                <Button icon="bi bi-search" :disabled="searchDisabled" class="white-space-nowrap" @click="onBuscarDni" />
                            </div>
                        </div>
                    </div>
                </div>
                <!-- Informacion Personal -->
                <div class="card-border">
                    <div class="flex align-items-center justify-content-center">
                        <div class="card-border-icon info2">
                            <i class="pi pi-users" style="font-size: 1.4rem" />
                        </div>
                        <span class="card-border-icon-text">Información Personal</span>
                    </div>
                    <div class="flex mt-8">
                        <div style="width: 70vw">
                            <div class="flex flex-col md:flex-row gap-4">
                                <!-- nombre -->
                                <div class="flex flex-wrap gap-2 w-full">
                                    <label for="nombre">Nombres</label>
                                    <InputText id="nombre" v-model="nombre" :disabled="camposNombreDeshabilitados" placeholder="Ej: Maria Alejandra" type="text" class="w-full" />
                                </div>
                                <!-- apellido paterno -->
                                <div class="flex flex-wrap gap-2 w-full">
                                    <label for="apaterno">Apellido Paterno</label>
                                    <InputText id="apaterno" v-model="apaterno" type="text" :disabled="camposNombreDeshabilitados" placeholder="Ej: Gonzales" class="w-full" />
                                </div>
                                <!-- apellido materno -->
                                <div class="flex flex-wrap gap-2 w-full">
                                    <label for="amaterno">Apellido Materno</label>
                                    <InputText id="amaterno" v-model="amaterno" type="text" :disabled="camposNombreDeshabilitados" placeholder="Ej: Quispe" class="w-full" />
                                </div>
                            </div>
                            <div class="flex flex-col md:flex-row gap-4" style="margin-top: 1.5rem">
                                <!-- Lugar de Nacimiento -->
                                <div class="flex flex-wrap gap-2 w-full">
                                    <label for="lnacimiento">Lugar de Nacimiento</label>
                                    <InputText id="lnacimiento" v-model="lnacimiento" type="text" placeholder="Ej: Cusco" class="w-full" />
                                </div>
                                <!-- Fecha Nacimiento -->
                                <div class="flex flex-wrap gap-2 w-full">
                                    <label for="fechaNac">Fecha de Nacimiento</label>
                                    <DatePicker id="fechaNac" v-model="fechaNacimiento" showIcon dateFormat="dd/mm/yy" placeholder="dd/mm/aaaa" class="w-full" />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <!--ifnormacion de contacto -->
                <div class="card-border">
                    <div class="flex align-items-center justify-content-center">
                        <div class="card-border-icon info3">
                            <i class="bi bi-telephone" style="font-size: 1.4rem" />
                        </div>
                        <span class="card-border-icon-text">Información de Contacto</span>
                    </div>
                    <div class="flex mt-8">
                        <div style="width: 70vw">
                            <div class="flex flex-col md:flex-row gap-4">
                                <!-- telefono -->
                                <div class="flex flex-wrap gap-2 w-full">
                                    <label for="telefono">Telefono Principal</label>
                                    <InputText id="telefono" v-model="telefono1" :maxlength="9" placeholder="Ej: 987654321" type="text" class="w-full" />
                                </div>
                                <!-- telefono 2 -->
                                <div class="flex flex-wrap gap-2 w-full">
                                    <label for="telefono2">Telefono Secundario</label>
                                    <InputText id="telefono2" v-model="telefono2" type="text" :maxlength="9" placeholder="Ej: 987654321" class="w-full" />
                                </div>
                            </div>
                            <!-- Correo  Personal-->
                            <div class="flex flex-col md:flex-row gap-4" style="margin-top: 1.5rem">
                                <div class="flex flex-wrap gap-2 w-full">
                                    <label for="correopersonal">Correo Personal </label>
                                    <IconField style="width: 100%">
                                        <InputIcon class="bi bi-envelope" />
                                        <InputText v-model="correopersonal" id="correopersonal" placeholder="usuario@example.com" type="text" class="w-full" />
                                    </IconField>
                                </div>
                            </div>
                            <!-- Direccion-->
                            <div class="flex flex-col md:flex-row gap-4" style="margin-top: 1.5rem">
                                <div class="flex flex-wrap gap-2 w-full">
                                    <label for="telefono">Direccion </label>
                                    <Textarea placeholder="Av Los Próceres 123, Lima" v-model="direccion" :autoResize="true" rows="3" cols="30" style="width: 100%" />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <!--ifnormacion de escuela -->
                <div class="card-border">
                    <div class="flex align-items-center justify-content-center">
                        <div class="card-border-icon info3">
                            <i class="bi bi-mortarboard-fill" style="font-size: 1.4rem" />
                        </div>
                        <span class="card-border-icon-text">Información de Colegio</span>
                    </div>
                    <div class="flex mt-8">
                        <div style="width: 70vw">
                            <div class="flex flex-col md:flex-row gap-4">
                                <!-- Seccion -->
                                <div class="flex flex-wrap gap-2 w-full">
                                    <label for="telefono">Seccion</label>
                                    <Select v-model="tipoSeccion" :options="tiposSeccion" optionLabel="label" optionValue="value" placeholder="Seleccione una seccion" class="w-full" />
                                </div>
                                <!-- Grado  -->
                                <div class="flex flex-wrap gap-2 w-full">
                                    <label for="telefono2">Grado</label>
                                    <Select v-model="gradoSeleccionado" :options="grados" :disabled="!tipoSeccion" placeholder="Seleccione el grado" class="w-full" />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div v-else-if="activeStep === 1">
                <!-- Informacion-->
                <div class="card-border-info crede">
                    <div class="flex align-items-center justify-content-center">
                        <div class="card-border-info-icon info">
                            <i class="pi pi-users" style="font-size: 1.4rem" />
                        </div>
                        <div style="margin-left: 1rem">
                            <h3 class="m-0 text-lg font-semibold" style="color: #fff; font-size: 1.5rem">Apoderados</h3>
                            <p class="m-0 text-sm opacity-90" style="color: #fff">Agregre los apoderados que estan con el alumno</p>
                        </div>
                    </div>
                </div>

                <div class="card-border">
                    <!-- data table -->
                    <DataTable :value="listaApoderados" class="w-full">
                        <template #header>
                            <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between w-full gap-2">
                                <div class="flex align-items-center justify-content-center">
                                    <div class="card-border-icon info">
                                        <i class="pi pi-users" style="font-size: 1.4rem" />
                                    </div>
                                    <span class="card-border-icon-text">Apoderados del Alumno</span>
                                </div>
                                <Button label="Agregar Apoderado" @click="abrirModalSecundario" />
                            </div>
                        </template>
                        <Column field="parentesco" header="Parentesco"></Column>
                        <Column field="nombres" header="Nombres"></Column>
                        <Column field="apellidoPaterno" header="Apellido Paterno"></Column>
                        <Column field="apellidoMaterno" header="Apellido Materno"></Column>
                        <Column field="tipoDocumento" header="Tipo Documento"></Column>
                        <Column field="numeroDocumento" header="Numero Documento"></Column>
                        <Column header="Acciones">
                            <template #body="slotProps">
                                <Button icon="pi pi-trash" class="p-button-danger p-button-sm" @click="eliminarApoderado(slotProps.index)" />
                            </template>
                        </Column>
                    </DataTable>
                </div>
            </div>
        </div>
        <!-- footer -->
        <template #footer>
            <Button label="Cancelar" text @click="cerrarDialogo" />
            <Button label="Anterior" text @click="pasoAnterior" :disabled="activeStep === 0" />
            <Button v-if="activeStep < steps.length - 1" label="Siguiente" text @click="siguientePaso" />
            <Button v-else label="Guardar" @click="guardarUsuario" icon="pi pi-check" />
        </template>
    </Dialog>
    <!--Segundo modal-->
    <Dialog v-model:visible="mostrarModalSecundario" class="modal-personalizado" modal header="Registrar Apoderados" :style="{ width: '93vw', maxWidth: '50rem' }" @update:visible="(val) => (mostrarModalSecundario = val)">
        <div class="contenedor-modal" style="margin-bottom: 17rem">
            <!-- Informacion-->
            <div class="card-border-info dp">
                <div class="flex align-items-center justify-content-center">
                    <div class="card-border-info-icon info">
                        <i class="pi pi-user" style="font-size: 1.4rem" />
                    </div>
                    <div style="margin-left: 1rem">
                        <h3 class="m-0 text-lg font-semibold" style="color: #fff; font-size: 1.5rem">Datos Personales</h3>
                        <p class="m-0 text-sm opacity-90" style="color: #fff">Complete la información del Apoderado</p>
                    </div>
                </div>
            </div>
            <!-- Identificacion-->
            <div class="card-border">
                <div class="flex align-items-center justify-content-center">
                    <div class="card-border-icon info2">
                        <i class="bi bi-person-vcard" style="font-size: 1.4rem" />
                    </div>
                    <span class="card-border-icon-text">Identificacion</span>
                </div>
                <div class="flex flex-col md:flex-row gap-4" style="margin-top: 1.5rem">
                    <!-- Tipo de Documento -->
                    <div class="flex flex-col w-full md:w-1/2">
                        <label class="mb-2" for="tipoDoc">Tipo de Documento</label>
                        <Select v-model="apoTipoSeleccionado" :options="tiposDocumento" optionLabel="label" optionValue="value" placeholder="Seleccione un documento" class="w-full" />
                    </div>
                    <!-- Número de Documento -->
                    <div class="flex flex-col w-full md:w-1/2">
                        <label class="mb-2" for="numeroDoc">Número de Documento</label>
                        <div>
                            <InputText placeholder="Ej: 12345678" style="width: 84%; margin-right: 0.5rem" v-model="apoNdocumento" :disabled="apoDocumentoDisabled" :maxlength="apoDocumentoMaxlength" />
                            <Button icon="bi bi-search" :disabled="apoSearchDisabled" class="white-space-nowrap" @click="onBuscarDniApo" />
                        </div>
                    </div>
                </div>
            </div>
            <!-- Informacion Personal -->
            <div class="card-border">
                <div class="flex align-items-center justify-content-center">
                    <div class="card-border-icon info2">
                        <i class="pi pi-users" style="font-size: 1.4rem" />
                    </div>
                    <span class="card-border-icon-text">Información Personal</span>
                </div>
                <div class="flex mt-8">
                    <div style="width: 70vw">
                        <div class="flex flex-col md:flex-row gap-4">
                            <!-- nombre -->
                            <div class="flex flex-wrap gap-2 w-full">
                                <label for="nombre">Nombres</label>
                                <InputText id="nombre" v-model="apoNombre" :disabled="apoCamposNombreDeshabilitados" placeholder="Ej: Maria Alejandra" type="text" class="w-full" />
                            </div>
                            <!-- apellido paterno -->
                            <div class="flex flex-wrap gap-2 w-full">
                                <label for="apaterno">Apellido Paterno</label>
                                <InputText id="apaterno" v-model="apoApaterno" type="text" :disabled="apoCamposNombreDeshabilitados" placeholder="Ej: Gonzales" class="w-full" />
                            </div>
                            <!-- apellido materno -->
                            <div class="flex flex-wrap gap-2 w-full">
                                <label for="amaterno">Apellido Materno</label>
                                <InputText id="amaterno" v-model="apoAmaterno" type="text" :disabled="apoCamposNombreDeshabilitados" placeholder="Ej: Quispe" class="w-full" />
                            </div>
                        </div>
                        <div class="flex flex-col md:flex-row gap-4" style="margin-top: 1.5rem">
                            <!-- Lugar de Nacimiento -->
                            <div class="flex flex-wrap gap-2 w-full">
                                <label for="lnacimiento">Lugar de Nacimiento</label>
                                <InputText id="lnacimiento" v-model="apoLnacimiento" type="text" placeholder="Ej: Cusco" class="w-full" />
                            </div>
                            <!-- Fecha Nacimiento -->
                            <div class="flex flex-wrap gap-2 w-full">
                                <label for="fechaNac">Fecha de Nacimiento</label>
                                <DatePicker id="fechaNac" v-model="apoFechaNacimiento" showIcon dateFormat="dd/mm/yy" placeholder="dd/mm/aaaa" class="w-full" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <!--ifnormacion de contacto -->
            <div class="card-border">
                <div class="flex align-items-center justify-content-center">
                    <div class="card-border-icon info3">
                        <i class="bi bi-telephone" style="font-size: 1.4rem" />
                    </div>
                    <span class="card-border-icon-text">Información de Contacto</span>
                </div>
                <div class="flex mt-8">
                    <div style="width: 70vw">
                        <div class="flex flex-col md:flex-row gap-4">
                            <!-- telefono -->
                            <div class="flex flex-wrap gap-2 w-full">
                                <label for="telefono">Telefono Principal</label>
                                <InputText id="telefono" v-model="apoTelefono1" :maxlength="9" placeholder="Ej: 987654321" type="text" class="w-full" />
                            </div>
                            <!-- telefono 2 -->
                            <div class="flex flex-wrap gap-2 w-full">
                                <label for="telefono2">Telefono Secundario</label>
                                <InputText id="telefono2" v-model="apoTelefono2" type="text" :maxlength="9" placeholder="Ej: 987654321" class="w-full" />
                            </div>
                        </div>
                        <!-- Correo  Personal-->
                        <div class="flex flex-col md:flex-row gap-4" style="margin-top: 1.5rem">
                            <div class="flex flex-wrap gap-2 w-full">
                                <label for="correopersonal">Correo Personal </label>
                                <IconField style="width: 100%">
                                    <InputIcon class="bi bi-envelope" />
                                    <InputText v-model="apoCorreopersonal" id="correopersonal" placeholder="usuario@example.com" type="text" class="w-full" />
                                </IconField>
                            </div>
                        </div>
                        <!-- Direccion-->
                        <div class="flex flex-col md:flex-row gap-4" style="margin-top: 1.5rem">
                            <div class="flex flex-wrap gap-2 w-full">
                                <label for="telefono">Direccion </label>
                                <Textarea placeholder="Av Los Próceres 123, Lima" v-model="apoDireccion" :autoResize="true" rows="3" cols="30" style="width: 100%" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <!--ifnormacion de escuela -->
            <div class="card-border">
                <div class="flex align-items-center justify-content-center">
                    <div class="card-border-icon info3">
                        <i class="bi bi-mortarboard-fill" style="font-size: 1.4rem" />
                    </div>
                    <span class="card-border-icon-text">Información de Colegio</span>
                </div>
                <div class="flex mt-8">
                    <div style="width: 70vw">
                        <div class="flex flex-col md:flex-row gap-4">
                            <!-- Seccion -->
                            <div class="flex flex-wrap gap-2 w-full">
                                <label for="telefono">Parentesco </label>
                                <Select v-model="apoParentesco" :options="opcionesParentesco" optionLabel="label" optionValue="value" placeholder="Seleccione parentesco" class="w-full" />
                            </div>
                            <!-- Grado  -->
                            <div class="flex flex-wrap gap-2 w-full">
                                <label for="telefono2">Convivencia</label>
                                <Select v-model="apoConvive" :options="opcionesConvive" optionLabel="label" placeholder="Seleccione la convivencia" optionValue="value" class="w-full" />
                            </div>
                        </div>
                    </div>
                </div>
                <div class="flex flex-col md:flex-row gap-4" style="margin-top: 1.5rem">
                    <div class="flex flex-wrap gap-2 w-full">
                        <label for="ocupacion">Ocupacion </label>
                        <InputText v-model="apoOcupacion" id="ocupacion" placeholder="Ej: Ama de Casa" type="text" class="w-full" />
                    </div>
                </div>
            </div>
        </div>
        <template #footer>
            <Button label="Cancelar" text @click="cerrarModalSecundario" />
            <Button label="Guardar" @click="guardarApoderado"></Button>
        </template>
    </Dialog>
</template>
