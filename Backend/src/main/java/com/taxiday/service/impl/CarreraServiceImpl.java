package com.taxiday.service.impl;

import com.taxiday.model.Carrera;
import com.taxiday.model.Carrera.TipoPago;
import com.taxiday.repository.CarreraRepository;
import com.taxiday.service.CarreraService;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.time.LocalDateTime;

@Service
public class CarreraServiceImpl implements CarreraService {

    private final CarreraRepository repo;

    public CarreraServiceImpl(CarreraRepository repo) {
        this.repo = repo;
    }

    @Override
    public Carrera crearCarrera(Carrera carrera) {
        // Establecer la fecha y hora actual como fecha de inicio
        carrera.setFechaInicio(LocalDateTime.now());
        return repo.save(carrera);
    }

    @Override
    public List<Carrera> listarCarreras() {
        return repo.findAll();
    }

    @Override
    public Optional<Carrera> buscarPorId(int id) {
        return repo.findById(id);
    }

    @Override
    public Carrera actualizarCarrera(int id, Carrera cambios) {
        return repo.findById(id).map(c -> {
            c.setFechaInicio(cambios.getFechaInicio());
            c.setImporteTotal(cambios.getImporteTotal());
            c.setImporteTaximetro(cambios.getImporteTaximetro());
            c.setTipoPago(cambios.getTipoPago());
            c.setTurno(cambios.getTurno());
            return repo.save(c);
        }).orElse(null);
    }

    @Override
    public boolean borrarCarrera(int id) {
        if (!repo.existsById(id)) return false;
        repo.deleteById(id);
        return true;
    }
    
    @Override
    public List<Carrera> buscarPorTurnoId(int turnoId) {
        return repo.findByTurnoIdTurno(turnoId);
    }
} 