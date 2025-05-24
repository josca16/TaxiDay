// src/main/java/com/taxiday/controller/JornadaController.java
package com.taxiday.controller;

import com.taxiday.dto.JornadaDto;
import com.taxiday.dto.TaxistaDto; // Necesario para la conversión
import com.taxiday.model.Jornada;
import com.taxiday.model.Jornada.EstadoJornada;
import com.taxiday.model.Taxista; // Necesario para la conversión
import com.taxiday.service.JornadaService;
import com.taxiday.repository.TaxistaRepository; // Necesario para buscar Taxista en conversión
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.taxiday.dto.TurnoDto;
import com.taxiday.dto.CarreraDto;
import com.taxiday.model.Turno;
import com.taxiday.model.Turno.EstadoTurno;
import com.taxiday.model.Carrera;
import com.taxiday.service.TurnoService;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/jornadas")
public class JornadaController {

    private final JornadaService service;
    private final TaxistaRepository taxistaRepo; // Necesario para buscar Taxista en conversión
    private final TurnoService turnoService; // Añadido para obtener turnos activos

    public JornadaController(JornadaService service, TaxistaRepository taxistaRepo, TurnoService turnoService) {
        this.service = service;
        this.taxistaRepo = taxistaRepo;
        this.turnoService = turnoService;
    }

    // Helper para convertir Jornada a JornadaDto
    private JornadaDto convertToDto(Jornada jornada) {
        if (jornada == null) return null;
        JornadaDto jornadaDto = new JornadaDto();
        jornadaDto.setIdJornada(jornada.getIdJornada());
        jornadaDto.setFechaInicio(jornada.getFechaInicio());
        jornadaDto.setFechaFinal(jornada.getFechaFinal());
        jornadaDto.setEstado(jornada.getEstado());
        // Convertir Taxista entity a TaxistaDto
        if (jornada.getTaxista() != null) {
            TaxistaDto taxistaDto = new TaxistaDto();
            taxistaDto.setIdTaxista(jornada.getTaxista().getIdTaxista());
            taxistaDto.setLicencia(jornada.getTaxista().getLicencia());
            taxistaDto.setNombre(jornada.getTaxista().getNombre());
            taxistaDto.setApellidos(jornada.getTaxista().getApellidos());
            taxistaDto.setEmail(jornada.getTaxista().getEmail());
            taxistaDto.setTelefono(jornada.getTaxista().getTelefono());
            jornadaDto.setTaxista(taxistaDto);
        }
        // Añadir turnos y carreras anidados
        if (jornada.getTurnos() != null) {
            List<TurnoDto> turnosDto = jornada.getTurnos().stream().map(turno -> {
                TurnoDto turnoDto = new TurnoDto();
                turnoDto.setIdTurno(turno.getIdTurno());
                turnoDto.setKmInicial(turno.getKmInicial());
                turnoDto.setKmFinal(turno.getKmFinal());
                turnoDto.setFechaInicio(turno.getFechaInicio());
                turnoDto.setFechaFinal(turno.getFechaFinal());
                turnoDto.setEstado(turno.getEstado());
                // Añadir carreras anidadas
                if (turno.getCarreras() != null) {
                    List<CarreraDto> carrerasDto = turno.getCarreras().stream().map(carrera -> {
                        CarreraDto carreraDto = new CarreraDto();
                        carreraDto.setIdCarrera(carrera.getIdCarrera());
                        carreraDto.setFechaInicio(carrera.getFechaInicio());
                        carreraDto.setImporteTotal(carrera.getImporteTotal());
                        carreraDto.setImporteTaximetro(carrera.getImporteTaximetro());
                        carreraDto.setTipoPago(carrera.getTipoPago());
                        carreraDto.setNotas(carrera.getNotas());
                        return carreraDto;
                    }).toList();
                    turnoDto.setCarreras(carrerasDto);
                }
                return turnoDto;
            }).toList();
            jornadaDto.setTurnos(turnosDto);
        }
        return jornadaDto;
    }
    
     // Helper para convertir JornadaDto a Jornada
    private Jornada convertToEntity(JornadaDto jornadaDto) {
         if (jornadaDto == null) return null;
         Jornada jornada = new Jornada();
         jornada.setFechaInicio(jornadaDto.getFechaInicio());
         jornada.setFechaFinal(jornadaDto.getFechaFinal());
         jornada.setEstado(jornadaDto.getEstado());
         // Convertir TaxistaDto a Taxista entity (requiere buscar la entidad)
         if (jornadaDto.getTaxista() != null && jornadaDto.getTaxista().getIdTaxista() != 0) {
             Taxista taxista = taxistaRepo.findById(jornadaDto.getTaxista().getIdTaxista()).orElse(null);
             jornada.setTaxista(taxista);
         }
         return jornada;
    }

    @PostMapping
    public ResponseEntity<JornadaDto> crear(@RequestBody JornadaDto jornadaDto) {
        Jornada jornada = convertToEntity(jornadaDto);
        Jornada saved = service.crearJornada(jornada);
        return ResponseEntity.status(201).body(convertToDto(saved));
    }

    @GetMapping
    public List<JornadaDto> listar() {
        List<Jornada> jornadas = service.listarJornadas();
        return jornadas.stream()
                       .map(this::convertToDto)
                       .collect(Collectors.toList());
    }

    @GetMapping("/{id}")
    public ResponseEntity<JornadaDto> get(@PathVariable int id) {
        return service.buscarPorId(id)
                   .map(this::convertToDto)
                   .map(ResponseEntity::ok)
                   .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/{id}")
    public ResponseEntity<JornadaDto> actualizar(@PathVariable int id,
                                              @RequestBody JornadaDto cambiosDto) {
        Jornada cambios = convertToEntity(cambiosDto);
        Jornada updated = service.actualizarJornada(id, cambios);
        if (updated == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(convertToDto(updated));
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
            @RequestBody JornadaDto datosDto
    ) {
        Jornada datosCierre = convertToEntity(datosDto); // Convertir DTO a entidad para el servicio
        return service.cerrarJornada(id, datosCierre)
                .map(this::convertToDto)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
    
    /** Obtiene el turno activo de una jornada */
    @GetMapping("/{id}/turno-activo")
    public ResponseEntity<TurnoDto> getTurnoActivo(@PathVariable int id) {
        // Verificar que la jornada existe
        Optional<Jornada> jornadaOpt = service.buscarPorId(id);
        if (!jornadaOpt.isPresent()) {
            return ResponseEntity.notFound().build();
        }
        
        // Buscar turnos activos en esta jornada
        List<Turno> turnosActivos = turnoService.findByJornadaIdAndEstado(id, EstadoTurno.abierto);
        
        if (turnosActivos.isEmpty()) {
            return ResponseEntity.ok().build(); // No hay turno activo
        }
        
        // Tomar el primer turno activo (debería ser único según la validación del servicio)
        Turno turnoActivo = turnosActivos.get(0);
        
        // Convertir a DTO con información completa incluyendo carreras
        TurnoDto turnoDto = new TurnoDto();
        turnoDto.setIdTurno(turnoActivo.getIdTurno());
        turnoDto.setKmInicial(turnoActivo.getKmInicial());
        turnoDto.setKmFinal(turnoActivo.getKmFinal());
        turnoDto.setFechaInicio(turnoActivo.getFechaInicio());
        turnoDto.setFechaFinal(turnoActivo.getFechaFinal());
        turnoDto.setEstado(turnoActivo.getEstado());
        
        // Añadir carreras si existen
        if (turnoActivo.getCarreras() != null && !turnoActivo.getCarreras().isEmpty()) {
            List<CarreraDto> carrerasDto = turnoActivo.getCarreras().stream()
                .map(carrera -> {
                    CarreraDto dto = new CarreraDto();
                    dto.setIdCarrera(carrera.getIdCarrera());
                    dto.setFechaInicio(carrera.getFechaInicio());
                    dto.setImporteTotal(carrera.getImporteTotal());
                    dto.setImporteTaximetro(carrera.getImporteTaximetro());
                    dto.setTipoPago(carrera.getTipoPago());
                    dto.setNotas(carrera.getNotas());
                    return dto;
                })
                .collect(Collectors.toList());
            turnoDto.setCarreras(carrerasDto);
        }
        
        return ResponseEntity.ok(turnoDto);
    }
}
