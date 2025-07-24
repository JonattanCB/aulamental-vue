import api from './api';

function listAlumnos(nombreCadena = '') {
    return api.get('/api/alumno/list', {
        params: { nombre: nombreCadena }
    });
}

export async function listALumnoPage(page = 0, size = 10, nombre = '') {
    try {
        const response = await api.get(`/api/alumno/list/page`, {
            params: {
                page,
                size,
                nombre
            }
        });
        return response.data;
    } catch (error) {
        console.error('Error al obtener atenciones:', error);
        throw error;
    }
}

export async function getAlumnoById(id) {
    try {
        const response = await api.get(`/api/alumno/${id}`);
        return response.data;
    } catch (error) {
        console.error('Error al obtener alumno:', error);
        throw error;
    }
}

export const crearAlumno = async (alumnoData) => {
    try {
        const response = await api.post('/api/alumno/create', alumnoData);
        return response.data;
    } catch (error) {
        console.error('Error al crear alumno:', error);
        throw error;
    }
};

export const editarAlumno = async (alumnoData) => {
    try {
        const response = await api.put('/api/alumno/editar', alumnoData);
        return response.data;
    } catch (error) {
        console.error('Error al editar alumno:', error);
        throw error;
    }
};

export default { listAlumnos, listALumnoPage, getAlumnoById, crearAlumno, editarAlumno };
