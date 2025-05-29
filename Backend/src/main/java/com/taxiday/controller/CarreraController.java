// src/main/java/com/taxiday/controller/CarreraController.java
package com.taxiday.controller;

import com.taxiday.dto.CarreraDto;
import com.taxiday.model.Carrera;
import com.taxiday.service.CarreraService;
import com.taxiday.model.Turno;
import com.taxiday.service.TurnoService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;
import java.util.HashMap;
import java.time.ZoneId;
import java.time.ZonedDateTime;

@RestController
@RequestMapping("/api/carreras")
public class CarreraController {

    private final CarreraService service;
    private final TurnoService turnoService;

    public CarreraController(CarreraService service, TurnoService turnoService) {
        this.service = service;
        this.turnoService = turnoService;
    }
    
    // Helper para convertir Carrera a CarreraDto
    private CarreraDto convertToDto(Carrera carrera) {
        if (carrera == null) return null;
        CarreraDto carreraDto = new CarreraDto();
        carreraDto.setIdCarrera(carrera.getIdCarrera());
        carreraDto.setFechaInicio(carrera.getFechaInicio());
        carreraDto.setImporteTotal(carrera.getImporteTotal());
        carreraDto.setImporteTaximetro(carrera.getImporteTaximetro());
        carreraDto.setPropina(carrera.getPropina());
        carreraDto.setTipoPago(carrera.getTipoPago());
        carreraDto.setEsAeropuerto(carrera.getEsAeropuerto());
        carreraDto.setEsEmisora(carrera.getEsEmisora());
        carreraDto.setNotas(carrera.getNotas());
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
         carrera.setEsAeropuerto(carreraDto.getEsAeropuerto());
         carrera.setEsEmisora(carreraDto.getEsEmisora());
         carrera.setNotas(carreraDto.getNotas());
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
        existingCarrera.setEsAeropuerto(cambiosDto.getEsAeropuerto());
        existingCarrera.setEsEmisora(cambiosDto.getEsEmisora());
        existingCarrera.setNotas(cambiosDto.getNotas());
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

    // Añadir endpoint para actualizar solo las notas de una carrera
    @PutMapping("/{id}/notas")
    public ResponseEntity<?> actualizarNotas(@PathVariable int id, @RequestBody Map<String, String> requestBody) {
        String notas = requestBody.get("notas");
        
        if (notas == null) {
            return ResponseEntity.badRequest().body("El campo 'notas' es requerido");
        }
        
        try {
            Optional<Carrera> carreraOpt = service.buscarPorId(id);
            
            if (!carreraOpt.isPresent()) {
                return ResponseEntity.notFound().build();
            }
            
            Carrera carrera = carreraOpt.get();
            // Solo actualizamos el campo notas
            carrera.setNotas(notas);
            
            Carrera carreraActualizada = service.actualizarCarrera(id, carrera);
            
            // Para evitar confusiones en el frontend
            Map<String, Object> response = new HashMap<>();
            response.put("idCarrera", id);
            response.put("notas", notas);
            response.put("success", true);
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error al actualizar las notas: " + e.getMessage());
        }
    }

    @PostMapping("/turno/{turnoId}")
    public ResponseEntity<?> crearCarreraParaTurno(@PathVariable int turnoId, @RequestBody Map<String, Object> body) {
        try {
            // Validar que el turno existe y está activo
            Optional<Turno> turnoOpt = turnoService.buscarPorId(turnoId);
            if (!turnoOpt.isPresent()) {
                return ResponseEntity.notFound().build();
            }
            
            Turno turno = turnoOpt.get();
            if (turno.getEstado() == Turno.EstadoTurno.cerrado) {
                return ResponseEntity.badRequest().body("No se pueden añadir carreras a un turno cerrado");
            }

            // Obtener zona horaria del request o usar la del sistema por defecto
            String zonaHoraria = body.get("zonaHoraria") instanceof String ?
                (String) body.get("zonaHoraria") : ZoneId.systemDefault().getId();
            
            ZonedDateTime fechaLocal = ZonedDateTime.now(ZoneId.of(zonaHoraria));

            // Crear la nueva carrera
            Carrera carrera = new Carrera();
            carrera.setImporteTotal(((Number) body.get("importeTotal")).doubleValue());
            carrera.setImporteTaximetro(body.get("importeTaximetro") instanceof Number ?
                ((Number) body.get("importeTaximetro")).doubleValue() : 0.0);
            carrera.setTipoPago(Carrera.TipoPago.valueOf(((String) body.get("tipoPago")).toLowerCase()));
            carrera.setEsAeropuerto((Boolean) body.getOrDefault("esAeropuerto", false));
            carrera.setEsEmisora((Boolean) body.getOrDefault("esEmisora", false));
            carrera.setNotas((String) body.getOrDefault("notas", ""));
            carrera.setFechaInicio(fechaLocal.toLocalDateTime());
            carrera.setTurno(turno);

            Carrera saved = service.crearCarrera(carrera);
            return ResponseEntity.status(201).body(saved);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}
