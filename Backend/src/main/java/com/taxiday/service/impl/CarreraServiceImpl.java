package com.taxiday.service.impl;

import com.taxiday.dto.CarreraDto;
import com.taxiday.model.Carrera;
import com.taxiday.model.Carrera.TipoPago;
import com.taxiday.repository.CarreraRepository;
import com.taxiday.service.CarreraService;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;
import java.time.LocalDateTime;

@Service
public class CarreraServiceImpl implements CarreraService {

    private final CarreraRepository repo;

    public CarreraServiceImpl(CarreraRepository repo) {
        this.repo = repo;
    }

    // Helper para convertir Carrera a CarreraDto
    private CarreraDto convertToDto(Carrera carrera) {
        if (carrera == null) return null;
        CarreraDto carreraDto = new CarreraDto();
        carreraDto.setIdCarrera(carrera.getIdCarrera());
        carreraDto.setFechaInicio(carrera.getFechaInicio());
        carreraDto.setImporteTotal(carrera.getImporteTotal());
        carreraDto.setImporteTaximetro(carrera.getImporteTaximetro());
        carreraDto.setTipoPago(carrera.getTipoPago());
        // No incluimos Turno en el DTO de Carrera
        return carreraDto;
    }
    
    // Helper para convertir CarreraDto a Carrera
    private Carrera convertToEntity(CarreraDto carreraDto) {
         if (carreraDto == null) return null;
         Carrera carrera = new Carrera();
         carrera.setIdCarrera(carreraDto.getIdCarrera());
         carrera.setFechaInicio(carreraDto.getFechaInicio());
         carrera.setImporteTotal(carreraDto.getImporteTotal());
         carrera.setImporteTaximetro(carreraDto.getImporteTaximetro());
         carrera.setTipoPago(carreraDto.getTipoPago());
          // El Turno asociado debería manejarse al crear/actualizar la Carrera
         return carrera;
    }

    @Override
    public Carrera crearCarrera(Carrera carrera) {
        // Establecer la fecha y hora actual como fecha de inicio
        carrera.setFechaInicio(java.time.LocalDateTime.now());
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
} 