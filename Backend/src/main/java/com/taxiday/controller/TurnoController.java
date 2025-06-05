// src/main/java/com/taxiday/controller/TurnoController.java
package com.taxiday.controller;

import com.taxiday.dto.TurnoDto;
import com.taxiday.dto.CarreraDto;
import com.taxiday.model.Jornada;
import com.taxiday.model.Turno;
import com.taxiday.model.Turno.EstadoTurno;
import com.taxiday.model.Carrera;
import com.taxiday.service.JornadaService;
import com.taxiday.service.TurnoService;
import com.taxiday.service.CarreraService;
import com.taxiday.util.DtoConverter;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime; // Importar LocalDateTime
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;
import java.util.Map;
import java.util.HashMap;
import java.time.ZoneId;
import java.time.ZonedDateTime;

@RestController
@RequestMapping("/api/turnos")
public class TurnoController {

    private final TurnoService service;
    private final JornadaService jornadaService; // Inyectar JornadaService
    private final CarreraService carreraService; // Inyectar CarreraService

    public TurnoController(TurnoService service, JornadaService jornadaService, CarreraService carreraService) { // Modificar constructor
        this.service = service;
        this.jornadaService = jornadaService;
        this.carreraService = carreraService;
    }
    
    // Endpoint para obtener las carreras de un turno específico
    @GetMapping("/{turnoId}/carreras")
    public ResponseEntity<List<CarreraDto>> getCarrerasByTurnoId(@PathVariable int turnoId) {
        Optional<Turno> turnoOptional = service.buscarPorId(turnoId);
        if (!turnoOptional.isPresent()) {
            return ResponseEntity.notFound().build();
        }
        
        List<Carrera> carreras = carreraService.buscarPorTurnoId(turnoId);
        List<CarreraDto> carrerasDto = carreras.stream()
                                             .map(DtoConverter::toCarreraDto)
                                             .collect(Collectors.toList());
        
        return ResponseEntity.ok(carrerasDto);
    }

    @PostMapping("/jornada/{jornadaId}") // Añadimos jornadaId como variable de path
    public ResponseEntity<TurnoDto> crear(@PathVariable int jornadaId, @RequestBody TurnoDto turnoDto) {
        Optional<Jornada> jornadaOptional = jornadaService.buscarPorId(jornadaId); // Buscar la Jornada por ID
        if (!jornadaOptional.isPresent()) {
            return ResponseEntity.notFound().build(); // Retornar 404 si la jornada no existe
        }
        Jornada jornada = jornadaOptional.get();

        Turno turno = DtoConverter.toTurnoEntity(turnoDto);
        turno.setFechaInicio(LocalDateTime.now()); // Establecer fecha y hora actual
        turno.setJornada(jornada); // Asignar la Jornada al Turno

        Turno saved = service.crearTurno(turno);
        return ResponseEntity.status(201).body(DtoConverter.toTurnoDto(saved));
    }
    
    @GetMapping
    public List<TurnoDto> listar() {
        List<Turno> turnos = service.listarTurnos();
        return turnos.stream()
                       .map(DtoConverter::toTurnoDto)
                       .collect(Collectors.toList());
    }

    @GetMapping("/{id}")
    public ResponseEntity<TurnoDto> get(@PathVariable int id) {
        return service.buscarPorId(id)
                   .map(DtoConverter::toTurnoDto)
                   .map(ResponseEntity::ok)
                   .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/{id}")
    public ResponseEntity<TurnoDto> actualizar(@PathVariable int id,
                                            @RequestBody TurnoDto cambiosDto) {
        // En la actualización, primero obtenemos la entidad existente
        Optional<Turno> existingTurnoOptional = service.buscarPorId(id);
        if (!existingTurnoOptional.isPresent()) {
            return ResponseEntity.notFound().build();
        }
        Turno existingTurno = existingTurnoOptional.get();
        
        // Aplicar cambios del DTO a la entidad existente
        existingTurno.setKmInicial(cambiosDto.getKmInicial());
        existingTurno.setKmFinal(cambiosDto.getKmFinal());
        existingTurno.setFechaInicio(cambiosDto.getFechaInicio());
        existingTurno.setFechaFinal(cambiosDto.getFechaFinal());
        existingTurno.setEstado(cambiosDto.getEstado());
        // La Jornada asociada no se actualiza desde el DTO aquí
        
        Turno updated = service.actualizarTurno(id, existingTurno); // Pasar la entidad actualizada al servicio
        
        if (updated == null) { // Aunque el servicio debería devolver la entidad actualizada o null si falla
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(DtoConverter.toTurnoDto(updated));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> borrar(@PathVariable int id) {
        boolean deleted = service.borrarTurno(id);
        if (!deleted) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.noContent().build();
    }

    /** Cierra un turno: front envía {"fechaFinal":"2025-05-12T18:30:00","kmFinal":123.4} */
    @PostMapping("/{id}/cerrar")
    public ResponseEntity<?> cerrarTurno(
            @PathVariable int id,
            @RequestBody Map<String, Object> body
    ) {
        try {
            Double kmFinal = body.get("kmFinal") instanceof Number ? 
                ((Number) body.get("kmFinal")).doubleValue() : null;
            
            if (kmFinal == null) {
                return ResponseEntity.badRequest().body("El kilómetro final es requerido");
            }

            String notas = body.get("notas") instanceof String ? 
                (String) body.get("notas") : "";
            
            String zonaHoraria = body.get("zonaHoraria") instanceof String ?
                (String) body.get("zonaHoraria") : ZoneId.systemDefault().getId();
            
            ZonedDateTime fechaLocal = ZonedDateTime.now(ZoneId.of(zonaHoraria));

            Turno turno = new Turno();
            turno.setKmFinal(kmFinal);
            turno.setNotas(notas);
            turno.setFechaFinal(fechaLocal.toLocalDateTime());
            turno.setEstado(EstadoTurno.cerrado);

            Optional<Turno> turnoCerrado = service.cerrarTurno(id, turno);
            if (!turnoCerrado.isPresent()) {
                return ResponseEntity.notFound().build();
            }

            return ResponseEntity.ok(DtoConverter.toTurnoDto(turnoCerrado.get()));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // Nuevo endpoint para actualizar las notas de un turno
    @PutMapping("/{id}/notas")
    public ResponseEntity<?> actualizarNotas(@PathVariable int id, @RequestBody Map<String, String> body) {
        String notas = body.get("notas");
        if (notas == null) {
            return ResponseEntity.badRequest().body("Las notas son requeridas");
        }
        
        try {
            Turno turno = service.actualizarNotas(id, notas);
            if (turno == null) {
                return ResponseEntity.notFound().build();
            }
            return ResponseEntity.ok(turno);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // Endpoint para pausar un turno
    @PostMapping("/{turnoId}/pausar")
    public ResponseEntity<?> pausarTurno(@PathVariable int turnoId) {
        try {
            Optional<Turno> turnoOpt = service.buscarPorId(turnoId);
            
            if (!turnoOpt.isPresent()) {
                return ResponseEntity.notFound().build();
            }
            
            Turno turno = turnoOpt.get();
            
            // Verificar si el turno ya está en pausa o cerrado
            if (turno.getEstado() == EstadoTurno.cerrado) {
                return ResponseEntity.badRequest().body("No se puede pausar un turno cerrado");
            }
            
            if (turno.getEstadoPausa() == Turno.EstadoPausa.pausado) {
                return ResponseEntity.badRequest().body("El turno ya está en pausa");
            }
            
            // Actualizar estado y tiempo de inicio de pausa
            turno.setEstadoPausa(Turno.EstadoPausa.pausado);
            turno.setInicioUltimaPausa(LocalDateTime.now());
            
            // Guardar cambios
            Turno updated = service.actualizarTurno(turnoId, turno);
            
            Map<String, Object> response = new HashMap<>();
            response.put("idTurno", updated.getIdTurno());
            response.put("estadoPausa", updated.getEstadoPausa().toString());
            response.put("inicioUltimaPausa", updated.getInicioUltimaPausa());
            response.put("tiempoPausadoSegundos", updated.getTiempoPausadoSegundos());
            response.put("mensaje", "Turno pausado correctamente");
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Error al pausar el turno: " + e.getMessage());
        }
    }
    
    // Endpoint para reanudar un turno pausado
    @PostMapping("/{turnoId}/reanudar")
    public ResponseEntity<?> reanudarTurno(@PathVariable int turnoId) {
        try {
            Optional<Turno> turnoOpt = service.buscarPorId(turnoId);
            
            if (!turnoOpt.isPresent()) {
                return ResponseEntity.notFound().build();
            }
            
            Turno turno = turnoOpt.get();
            
            // Verificar si el turno está cerrado o no está en pausa
            if (turno.getEstado() == EstadoTurno.cerrado) {
                return ResponseEntity.badRequest().body("No se puede reanudar un turno cerrado");
            }
            
            if (turno.getEstadoPausa() != Turno.EstadoPausa.pausado) {
                return ResponseEntity.badRequest().body("El turno no está en pausa");
            }
            
            // Calcular el tiempo que ha estado en pausa
            LocalDateTime ahora = LocalDateTime.now();
            LocalDateTime inicioPausa = turno.getInicioUltimaPausa();
            
            if (inicioPausa != null) {
                // Calcular segundos entre inicio de pausa y ahora
                long segundosPausados = java.time.Duration.between(inicioPausa, ahora).getSeconds();
                
                // Añadir al tiempo total pausado
                long tiempoPausadoTotal = turno.getTiempoPausadoSegundos() != null ? 
                                          turno.getTiempoPausadoSegundos() + segundosPausados : 
                                          segundosPausados;
                
                turno.setTiempoPausadoSegundos(tiempoPausadoTotal);
            }
            
            // Actualizar estado
            turno.setEstadoPausa(Turno.EstadoPausa.activo);
            turno.setInicioUltimaPausa(null);
            
            // Guardar cambios
            Turno updated = service.actualizarTurno(turnoId, turno);
            
            Map<String, Object> response = new HashMap<>();
            response.put("idTurno", updated.getIdTurno());
            response.put("estadoPausa", updated.getEstadoPausa().toString());
            response.put("tiempoPausadoSegundos", updated.getTiempoPausadoSegundos());
            response.put("mensaje", "Turno reanudado correctamente");
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Error al reanudar el turno: " + e.getMessage());
        }
    }
    
    // Endpoint para obtener estadísticas de tiempo de un turno
    @GetMapping("/{turnoId}/estadisticas")
    public ResponseEntity<?> obtenerEstadisticasTiempo(@PathVariable int turnoId) {
        try {
            Optional<Turno> turnoOpt = service.buscarPorId(turnoId);
            
            if (!turnoOpt.isPresent()) {
                return ResponseEntity.notFound().build();
            }
            
            Turno turno = turnoOpt.get();
            Map<String, Object> estadisticas = new HashMap<>();
            
            // Tiempo total desde inicio (incluyendo pausas)
            LocalDateTime inicio = turno.getFechaInicio();
            LocalDateTime fin = turno.getFechaFinal() != null ? turno.getFechaFinal() : LocalDateTime.now();
            long segundosTotales = java.time.Duration.between(inicio, fin).getSeconds();
            
            // Tiempo pausado
            long segundosPausados = turno.getTiempoPausadoSegundos() != null ? turno.getTiempoPausadoSegundos() : 0L;
            
            // Si está actualmente en pausa, añadir el tiempo actual de pausa
            if (turno.getEstadoPausa() == Turno.EstadoPausa.pausado && turno.getInicioUltimaPausa() != null) {
                segundosPausados += java.time.Duration.between(turno.getInicioUltimaPausa(), LocalDateTime.now()).getSeconds();
            }
            
            // Tiempo efectivo de trabajo
            long segundosTrabajados = segundosTotales - segundosPausados;
            
            // Convertir segundos a formato hh:mm:ss
            estadisticas.put("tiempoTotal", formatearTiempo(segundosTotales));
            estadisticas.put("tiempoPausado", formatearTiempo(segundosPausados));
            estadisticas.put("tiempoTrabajado", formatearTiempo(segundosTrabajados));
            
            // También incluir los valores en segundos
            estadisticas.put("segundosTotales", segundosTotales);
            estadisticas.put("segundosPausados", segundosPausados);
            estadisticas.put("segundosTrabajados", segundosTrabajados);
            
            estadisticas.put("estadoPausa", turno.getEstadoPausa().toString());
            
            return ResponseEntity.ok(estadisticas);
            
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Error al obtener estadísticas: " + e.getMessage());
        }
    }
    
    // Método auxiliar para formatear tiempo en segundos a formato hh:mm:ss
    private String formatearTiempo(long segundos) {
        long horas = segundos / 3600;
        long minutos = (segundos % 3600) / 60;
        long segs = segundos % 60;
        
        return String.format("%02d:%02d:%02d", horas, minutos, segs);
    }
}
