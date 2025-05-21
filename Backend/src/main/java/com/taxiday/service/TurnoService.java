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
}
