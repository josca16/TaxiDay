package com.taxiday.service.impl;

import com.taxiday.dto.TurnoDto;
import com.taxiday.model.Turno;
import com.taxiday.model.Turno.EstadoTurno;
import com.taxiday.repository.TurnoRepository;
import com.taxiday.service.TurnoService;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class TurnoServiceImpl implements TurnoService {

    private final TurnoRepository repo;

    public TurnoServiceImpl(TurnoRepository repo) {
        this.repo = repo;
    }

    // Helper para convertir Turno a TurnoDto
    private TurnoDto convertToDto(Turno turno) {
        if (turno == null) return null;
        TurnoDto turnoDto = new TurnoDto();
        turnoDto.setIdTurno(turno.getIdTurno());
        turnoDto.setKmInicial(turno.getKmInicial());
        turnoDto.setKmFinal(turno.getKmFinal());
        turnoDto.setFechaInicio(turno.getFechaInicio());
        turnoDto.setFechaFinal(turno.getFechaFinal());
        turnoDto.setEstado(turno.getEstado());
        // No incluimos Jornada en el DTO de Turno
        return turnoDto;
    }
    
     // Helper para convertir TurnoDto a Turno
    private Turno convertToEntity(TurnoDto turnoDto) {
         if (turnoDto == null) return null;
         Turno turno = new Turno();
         turno.setIdTurno(turnoDto.getIdTurno());
         turno.setKmInicial(turnoDto.getKmInicial());
         turno.setKmFinal(turnoDto.getKmFinal());
         turno.setFechaInicio(turnoDto.getFechaInicio());
         turno.setFechaFinal(turnoDto.getFechaFinal());
         turno.setEstado(turnoDto.getEstado());
         // La Jornada asociada debería manejarse al crear/actualizar el Turno
         return turno;
    }

    @Override
    public Turno crearTurno(Turno turno) {
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
            t.setKmInicial(cambios.getKmInicial());
            t.setKmFinal(cambios.getKmFinal());
            t.setFechaInicio(cambios.getFechaInicio());
            t.setFechaFinal(cambios.getFechaFinal());
            t.setEstado(cambios.getEstado());
            t.setJornada(cambios.getJornada());
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
            turno.setFechaFinal(datosCierre.getFechaFinal());
            turno.setKmFinal(datosCierre.getKmFinal());
            turno.setEstado(EstadoTurno.cerrado);
            return repo.save(turno);
        });
    }
} 