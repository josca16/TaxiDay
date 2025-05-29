package com.taxiday.service;

import com.taxiday.model.Turno;
import com.taxiday.model.Turno.EstadoTurno;

import java.util.List;
import java.util.Optional;

public interface TurnoService {
    Turno crearTurno(Turno turno);
    List<Turno> listarTurnos();
    Optional<Turno> buscarPorId(int id);
    Turno actualizarTurno(int id, Turno cambios);
    boolean borrarTurno(int id);
    Optional<Turno> cerrarTurno(int id, Turno datosCierre);
    List<Turno> findByJornadaIdAndEstado(int jornadaId, EstadoTurno estado);
    
    /**
     * Actualiza únicamente las notas de un turno sin modificar los demás campos
     * @param id El ID del turno a actualizar
     * @param notas El nuevo texto de las notas
     * @return El turno actualizado o null si no existe
     */
    Turno actualizarNotasTurno(int id, String notas);

    /**
     * Actualiza las notas de un turno
     * @param id ID del turno
     * @param notas Las nuevas notas
     * @return el turno actualizado o null si no existe
     */
    Turno actualizarNotas(int id, String notas);
}
