package com.taxiday.service;

import com.taxiday.model.Carrera;

import java.util.List;
import java.util.Optional;

public interface CarreraService {
    Carrera crearCarrera(Carrera carrera);
    List<Carrera> listarCarreras();
    Optional<Carrera> buscarPorId(int id);
    Carrera actualizarCarrera(int id, Carrera cambios);
    boolean borrarCarrera(int id);
}
