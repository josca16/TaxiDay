// src/main/java/com/taxiday/controller/JornadaController.java
package com.taxiday.controller;

import com.taxiday.dto.JornadaDto;
import com.taxiday.model.Jornada;
import com.taxiday.model.Jornada.EstadoJornada;
import com.taxiday.model.Taxista;
import com.taxiday.service.JornadaService;
import com.taxiday.repository.TaxistaRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.taxiday.dto.TurnoDto;
import com.taxiday.model.Turno;
import com.taxiday.model.Turno.EstadoTurno;
import com.taxiday.service.TurnoService;
import com.taxiday.util.DtoConverter;
import org.springframework.http.HttpStatus;
import java.time.ZoneId;
import java.time.ZonedDateTime;
import java.util.Map;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/jornadas")
public class JornadaController {

    private final JornadaService service;
    private final TaxistaRepository taxistaRepo;
    private final TurnoService turnoService;

    public JornadaController(JornadaService service, TaxistaRepository taxistaRepo, TurnoService turnoService) {
        this.service = service;
        this.taxistaRepo = taxistaRepo;
        this.turnoService = turnoService;
    }

    @PostMapping
    public ResponseEntity<JornadaDto> crear(@RequestBody JornadaDto jornadaDto) {
        // Convertir DTO a entidad
        Jornada jornada = DtoConverter.toJornadaEntity(jornadaDto);
        
        // Buscar y asignar el taxista si existe
        if (jornadaDto.getTaxista() != null && jornadaDto.getTaxista().getIdTaxista() != 0) {
            Taxista taxista = taxistaRepo.findById(jornadaDto.getTaxista().getIdTaxista()).orElse(null);
            jornada.setTaxista(taxista);
        }
        
        Jornada saved = service.crearJornada(jornada);
        return ResponseEntity.status(201).body(DtoConverter.toJornadaDto(saved));
    }

    @GetMapping
    public List<JornadaDto> listar() {
        List<Jornada> jornadas = service.listarJornadas();
        return jornadas.stream()
                       .map(DtoConverter::toJornadaDto)
                       .collect(Collectors.toList());
    }

    @GetMapping("/{id}")
    public ResponseEntity<JornadaDto> get(@PathVariable int id) {
        return service.buscarPorId(id)
                   .map(DtoConverter::toJornadaDto)
                   .map(ResponseEntity::ok)
                   .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/{id}")
    public ResponseEntity<JornadaDto> actualizar(@PathVariable int id,
                                              @RequestBody JornadaDto cambiosDto) {
        // Convertir DTO a entidad
        Jornada cambios = DtoConverter.toJornadaEntity(cambiosDto);
        
        // Buscar y asignar el taxista si existe
        if (cambiosDto.getTaxista() != null && cambiosDto.getTaxista().getIdTaxista() != 0) {
            Taxista taxista = taxistaRepo.findById(cambiosDto.getTaxista().getIdTaxista()).orElse(null);
            cambios.setTaxista(taxista);
        }
        
        Jornada updated = service.actualizarJornada(id, cambios);
        if (updated == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(DtoConverter.toJornadaDto(updated));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> borrar(@PathVariable int id) {
        boolean deleted = service.borrarJornada(id);
        if (!deleted) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.noContent().build();
    }

    /** Cierra la jornada: el front envía {"fechaFinal":"2025-05-12T20:00:00"} */
    @PostMapping("/{id}/cerrar")
    public ResponseEntity<JornadaDto> cerrarJornada(
            @PathVariable int id,
            @RequestBody Map<String, Object> body
    ) {
        try {
            // Obtener zona horaria del request o usar la del sistema por defecto
            String zonaHoraria = body.get("zonaHoraria") instanceof String ?
                (String) body.get("zonaHoraria") : ZoneId.systemDefault().getId();
            
            ZonedDateTime fechaLocal = ZonedDateTime.now(ZoneId.of(zonaHoraria));

            Jornada datosCierre = new Jornada();
            datosCierre.setFechaFinal(fechaLocal.toLocalDateTime());
            datosCierre.setEstado(EstadoJornada.cerrada);

            return service.cerrarJornada(id, datosCierre)
                    .map(DtoConverter::toJornadaDto)
                    .map(ResponseEntity::ok)
                    .orElse(ResponseEntity.notFound().build());
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }
    
    /** Obtiene el turno activo de una jornada */
    @GetMapping("/{id}/turno-activo")
    public ResponseEntity<TurnoDto> getTurnoActivo(@PathVariable int id) {
        try {
            // Verificar que la jornada existe
            Optional<Jornada> jornadaOpt = service.buscarPorId(id);
            if (!jornadaOpt.isPresent()) {
                return ResponseEntity.notFound().build();
            }
            
            // Buscar turnos activos en esta jornada
            List<Turno> turnosActivos = turnoService.findByJornadaIdAndEstado(id, EstadoTurno.abierto);
            
            if (turnosActivos.isEmpty()) {
                return ResponseEntity.ok(null);
            }
            
            // Tomar el primer turno activo (debería ser único según la validación del servicio)
            Turno turnoActivo = turnosActivos.get(0);
            
            // Usar DtoConverter para la conversión
            return ResponseEntity.ok(DtoConverter.toTurnoDto(turnoActivo));
            
        } catch (Exception e) {
            // Log del error
            e.printStackTrace();
            return ResponseEntity.ok(null); // Devolver null en caso de error para evitar error de JSON
        }
    }
}
