// src/main/java/com/taxiday/controller/CarreraController.java
package com.taxiday.controller;

import com.taxiday.dto.CarreraDto;
import com.taxiday.model.Carrera;
import com.taxiday.service.CarreraService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/carreras")
public class CarreraController {

    private final CarreraService service;

    public CarreraController(CarreraService service) {
        this.service = service;
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

    @PostMapping
    public ResponseEntity<CarreraDto> crear(@RequestBody CarreraDto carreraDto) {
        Carrera carrera = convertToEntity(carreraDto);
        // Aquí deberías asignar el Turno a la Carrera antes de guardarla
        Carrera saved = service.crearCarrera(carrera); // El servicio espera una entidad
        return ResponseEntity.status(201).body(convertToDto(saved));
    }

    @GetMapping
    public List<CarreraDto> listar() {
        List<Carrera> carreras = service.listarCarreras();
        return carreras.stream()
                       .map(this::convertToDto)
                       .collect(Collectors.toList());
    }

    @GetMapping("/{id}")
    public ResponseEntity<CarreraDto> get(@PathVariable int id) {
        return service.buscarPorId(id)
                   .map(this::convertToDto)
                   .map(ResponseEntity::ok)
                   .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/{id}")
    public ResponseEntity<CarreraDto> actualizar(@PathVariable int id,
                                              @RequestBody CarreraDto cambiosDto) {
        // En la actualización, primero obtenemos la entidad existente
        Optional<Carrera> existingCarreraOptional = service.buscarPorId(id);
        if (!existingCarreraOptional.isPresent()) {
            return ResponseEntity.notFound().build();
        }
        Carrera existingCarrera = existingCarreraOptional.get();
        
        // Aplicar cambios del DTO a la entidad existente
        existingCarrera.setFechaInicio(cambiosDto.getFechaInicio());
        existingCarrera.setImporteTotal(cambiosDto.getImporteTotal());
        existingCarrera.setImporteTaximetro(cambiosDto.getImporteTaximetro());
        existingCarrera.setTipoPago(cambiosDto.getTipoPago());
        // El Turno asociado no se actualiza desde el DTO aquí
        
        Carrera updated = service.actualizarCarrera(id, existingCarrera); // Pasar la entidad actualizada al servicio
        
         if (updated == null) { // Aunque el servicio debería devolver la entidad actualizada o null si falla
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(convertToDto(updated));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> borrar(@PathVariable int id) {
        boolean deleted = service.borrarCarrera(id);
        if (!deleted) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.noContent().build();
    }
}
