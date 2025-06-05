package com.taxiday.service.impl;

import com.taxiday.model.Turno;
import com.taxiday.model.Turno.EstadoTurno;
import com.taxiday.repository.TurnoRepository;
import com.taxiday.service.TurnoService;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class TurnoServiceImpl implements TurnoService {

    private final TurnoRepository repo;

    public TurnoServiceImpl(TurnoRepository repo) {
        this.repo = repo;
    }

    @Override
    public Turno crearTurno(Turno turno) {
        // Verificar si ya existe un turno activo en la misma jornada
        List<Turno> turnosActivos = repo.findByJornadaIdJornadaAndEstado(turno.getJornada().getIdJornada(), EstadoTurno.abierto);
        if (!turnosActivos.isEmpty()) {
            throw new IllegalStateException("Ya existe un turno activo en esta jornada. Debe cerrar el turno actual antes de crear uno nuevo.");
        }

        turno.setFechaInicio(LocalDateTime.now());
        turno.setEstado(EstadoTurno.abierto);
        return repo.save(turno);
    }

    @Override
    public List<Turno> listarTurnos() {
        return repo.findAll();
    }

    @Override
    public Optional<Turno> buscarPorId(int id) {
        return repo.findById(id);
    }

    @Override
    public Turno actualizarTurno(int id, Turno cambios) {
        return repo.findById(id).map(t -> {
            if (cambios.getKmInicial() != null) {
                t.setKmInicial(cambios.getKmInicial());
            }
            if (cambios.getKmFinal() != null) {
                t.setKmFinal(cambios.getKmFinal());
            }
            if (cambios.getFechaInicio() != null) {
                t.setFechaInicio(cambios.getFechaInicio());
            }
            if (cambios.getFechaFinal() != null) {
                t.setFechaFinal(cambios.getFechaFinal());
            }
            if (cambios.getEstado() != null) {
                t.setEstado(cambios.getEstado());
            }
            if (cambios.getNotas() != null) {
                t.setNotas(cambios.getNotas().trim());
            }
            if (cambios.getJornada() != null) {
                t.setJornada(cambios.getJornada());
            }
            return repo.save(t);
        }).orElse(null);
    }

    @Override
    public boolean borrarTurno(int id) {
        if (!repo.existsById(id)) return false;
        repo.deleteById(id);
        return true;
    }

    @Override
    public Optional<Turno> cerrarTurno(int id, Turno datosCierre) {
        return repo.findById(id).map(turno -> {
            turno.setFechaFinal(LocalDateTime.now());
            turno.setKmFinal(datosCierre.getKmFinal());
            turno.setEstado(EstadoTurno.cerrado);
            if (datosCierre.getNotas() != null && !datosCierre.getNotas().trim().isEmpty()) {
                turno.setNotas(datosCierre.getNotas());
            }
            return repo.save(turno);
        });
    }

    @Override
    public List<Turno> findByJornadaIdAndEstado(int jornadaId, EstadoTurno estado) {
        return repo.findByJornadaIdJornadaAndEstado(jornadaId, estado);
    }

    @Override
    public Turno actualizarNotasTurno(int id, String notas) {
        return repo.findById(id).map(t -> {
            if (notas != null) {
                t.setNotas(notas.trim());
            }
            return repo.save(t);
        }).orElse(null);
    }

    @Override
    public Turno actualizarNotas(int id, String notas) {
        return repo.findById(id).map(turno -> {
            turno.setNotas(notas);
            return repo.save(turno);
        }).orElse(null);
    }
} 