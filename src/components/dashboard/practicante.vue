<script setup>
import { getDashboardPracticante } from '@/service/dashboardService';
import { useToast } from 'primevue/usetoast';
import { onMounted, ref } from 'vue';

const toast = useToast();
const dashboardData = ref(null);
const idUsuario = localStorage.getItem('id');

const tipoMapeo = {
    ATENCIONALUMNO: 'Atención Alumno',
    ATENCIONAPODERADO: 'Atención Apoderado'
};

function formatearTitulo(tipo) {
    return tipoMapeo[tipo] || tipo;
}

onMounted(async () => {
    try {
        const data = await getDashboardPracticante(idUsuario);
        dashboardData.value = data;
    } catch (error) {
        console.error(error);
        toast.add({
            severity: 'error',
            summary: 'Error',
            detail: 'No se pudo cargar el dashboard',
            life: 3000
        });
    }
});
</script>
<template>
    <div class="grid grid-cols-6 gap-8">
        <div class="col-span-12 lg:col-span-6 xl:col-span-3">
            <div class="card mb-0">
                <div class="flex justify-between mb-4">
                    <div>
                        <span class="block text-muted-color font-medium mb-4">Total de Atenciones Pendiente</span>
                        <div class="text-surface-900 dark:text-surface-0 font-medium text-xl">{{ dashboardData ? dashboardData.perdientes : '0' }}</div>
                    </div>
                    <div class="flex items-center justify-center bg-purple-100 dark:bg-purple-400/10 rounded-border" style="width: 2.5rem; height: 2.5rem">
                        <i class="bi bi-file-earmark-text text-purple-500 !text-xl"></i>
                    </div>
                </div>
                <hr class="my-4 border-gray-300 dark:border-gray-700" />
                <div class="flex items-center justify-between w-full text-sm">
                    <div class="flex items-center gap-2 text-gray-700">
                        <i class="bi bi-calendar text-blue-600"></i>
                        <span>Estados de documentos: </span>
                    </div>
                    <span class="text-blue-600 font-semibold">{{ dashboardData ? dashboardData.enviados : '0' }} enviados</span>
                </div>
            </div>
        </div>
        <div class="col-span-12 lg:col-span-6 xl:col-span-3">
            <div class="card mb-0">
                <div class="grid grid-cols-12 gap-4">
                    <div class="col-span-12 md:col-span-6">
                        <div class="card green mb-0 h-19">
                            <div class="flex justify-between mb-0">
                                <div>
                                    <span class="block text-muted-color font-medium mb-2">Total de tareas cerradas</span>
                                    <div class="text-surface-900 dark:text-surface-0 font-medium text-xl">{{ dashboardData ? dashboardData.cerrados : '0' }}</div>
                                </div>
                                <div class="flex items-center justify-center bg-green-200 dark:bg-green-600/10 rounded-border" style="width: 2.5rem; height: 2.5rem">
                                    <i class="bi bi-patch-check text-green-500 !text-xl"></i>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="col-span-12 md:col-span-6">
                        <div class="card orange mb-0 h-19">
                            <div class="flex justify-between mb-0">
                                <div>
                                    <span class="block text-muted-color font-medium mb-2">Total de tarea de revicion</span>
                                    <div class="text-surface-900 dark:text-surface-0 font-medium text-xl">{{ dashboardData ? dashboardData.revisados : '0' }}</div>
                                </div>
                                <div class="flex items-center justify-center bg-red-200 dark:bg-red-600/10 rounded-border" style="width: 2.5rem; height: 2.5rem">
                                    <i class="bi bi-x-octagon text-red-500 !text-xl"></i>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <hr class="my-4 border-gray-300 dark:border-gray-700" />
                <div class="flex items-center justify-between w-full text-sm">
                    <div class="flex items-center gap-2 text-gray-700">
                        <i class="bi bi-calendar text-blue-600"></i>
                        <span>Estados de documentos: </span>
                    </div>
                    <span class="text-blue-600 font-semibold">{{ dashboardData ? dashboardData.enviados : '0' }} enviados</span>
                </div>
            </div>
        </div>
    </div>
</template>
