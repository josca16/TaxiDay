package com.taxiday.service;

import com.taxiday.model.Jornada;
import com.taxiday.model.Jornada.EstadoJornada;

import java.util.List;
import java.util.Optional;

public interface JornadaService {
    Jornada crearJornada(Jornada jornada);
    List<Jornada> listarJornadas();
    Optional<Jornada> buscarPorId(int id);
    Jornada actualizarJornada(int id, Jornada cambios);
    boolean borrarJornada(int id);
    Optional<Jornada> cerrarJornada(int id, Jornada datosCierre);
}
