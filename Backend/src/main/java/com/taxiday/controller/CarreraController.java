// src/main/java/com/taxiday/controller/CarreraController.java
package com.taxiday.controller;

import com.taxiday.dto.CarreraDto;
import com.taxiday.model.Carrera;
import com.taxiday.service.CarreraService;
import com.taxiday.model.Turno;
import com.taxiday.service.TurnoService;
import com.taxiday.util.DtoConverter;
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

    @GetMapping
    public List<CarreraDto> listar() {
        List<Carrera> carreras = service.listarCarreras();
        return carreras.stream()
                       .map(DtoConverter::toCarreraDto)
                       .collect(Collectors.toList());
    }

    @GetMapping("/{id}")
    public ResponseEntity<CarreraDto> get(@PathVariable int id) {
        return service.buscarPorId(id)
                   .map(DtoConverter::toCarreraDto)
                   .map(ResponseEntity::ok)
                   .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/{id}")
    public ResponseEntity<CarreraDto> actualizar(@PathVariable int id,
                                              @RequestBody CarreraDto cambiosDto) {
        Optional<Carrera> existingCarreraOptional = service.buscarPorId(id);
        if (!existingCarreraOptional.isPresent()) {
            return ResponseEntity.notFound().build();
        }
        Carrera existingCarrera = existingCarreraOptional.get();
        
        existingCarrera.setFechaInicio(cambiosDto.getFechaInicio());
        existingCarrera.setImporteTotal(cambiosDto.getImporteTotal());
        existingCarrera.setImporteTaximetro(cambiosDto.getImporteTaximetro());
        existingCarrera.setTipoPago(cambiosDto.getTipoPago());
        existingCarrera.setEsAeropuerto(cambiosDto.getEsAeropuerto());
        existingCarrera.setEsEmisora(cambiosDto.getEsEmisora());
        existingCarrera.setNotas(cambiosDto.getNotas());
        
        Carrera updated = service.actualizarCarrera(id, existingCarrera);
        
        if (updated == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(DtoConverter.toCarreraDto(updated));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> borrar(@PathVariable int id) {
        boolean deleted = service.borrarCarrera(id);
        if (!deleted) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.noContent().build();
    }

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
            carrera.setNotas(notas);
            
            Carrera carreraActualizada = service.actualizarCarrera(id, carrera);
            
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
            Optional<Turno> turnoOpt = turnoService.buscarPorId(turnoId);
            if (!turnoOpt.isPresent()) {
                return ResponseEntity.notFound().build();
            }
            
            Turno turno = turnoOpt.get();
            if (turno.getEstado() == Turno.EstadoTurno.cerrado) {
                return ResponseEntity.badRequest().body("No se pueden añadir carreras a un turno cerrado");
            }

            String zonaHoraria = body.get("zonaHoraria") instanceof String ?
                (String) body.get("zonaHoraria") : ZoneId.systemDefault().getId();
            
            ZonedDateTime fechaLocal = ZonedDateTime.now(ZoneId.of(zonaHoraria));

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
            return ResponseEntity.status(201).body(DtoConverter.toCarreraDto(saved));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}
