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
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime; // Importar LocalDateTime
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

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
    
    // Helper para convertir Turno a TurnoDto
    private TurnoDto convertToTurnoDto(Turno turno) {
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
    private Turno convertToTurnoEntity(TurnoDto turnoDto) {
         if (turnoDto == null) return null;
         Turno turno = new Turno();
         turno.setIdTurno(turnoDto.getIdTurno());
         turno.setKmInicial(turnoDto.getKmInicial());
         turno.setKmFinal(turnoDto.getKmFinal());
         // La fechaInicio y fechaFinal se establecen en el controlador o servicio
         // turno.setFechaInicio(turnoDto.getFechaInicio()); // Ya no se setea desde DTO al crear
         // turno.setFechaFinal(turnoDto.getFechaFinal()); // Ya no se setea desde DTO al crear
         turno.setEstado(turnoDto.getEstado());
         // La Jornada asociada debería manejarse al crear/actualizar el Turno
         return turno;
    }
    
    // Helper para convertir CarreraDto a Carrera
    private Carrera convertToCarreraEntity(CarreraDto carreraDto) {
        if (carreraDto == null) return null;
        Carrera carrera = new Carrera();
        carrera.setIdCarrera(carreraDto.getIdCarrera());
        // fechaInicio se establece al guardar
        carrera.setImporteTotal(carreraDto.getImporteTotal());
        carrera.setImporteTaximetro(carreraDto.getImporteTaximetro());
        carrera.setTipoPago(carreraDto.getTipoPago());
        // El Turno se asigna en el controlador
        return carrera;
    }
    
    // Helper para convertir Carrera a CarreraDto
    private CarreraDto convertToCarreraDto(Carrera carrera) {
        if (carrera == null) return null;
        CarreraDto carreraDto = new CarreraDto();
        carreraDto.setIdCarrera(carrera.getIdCarrera());
        carreraDto.setFechaInicio(carrera.getFechaInicio());
        carreraDto.setImporteTotal(carrera.getImporteTotal());
        carreraDto.setImporteTaximetro(carrera.getImporteTaximetro());
        carreraDto.setTipoPago(carrera.getTipoPago());
        return carreraDto;
    }

    @PostMapping("/jornada/{jornadaId}") // Añadimos jornadaId como variable de path
    public ResponseEntity<TurnoDto> crear(@PathVariable int jornadaId, @RequestBody TurnoDto turnoDto) {
        Optional<Jornada> jornadaOptional = jornadaService.buscarPorId(jornadaId); // Buscar la Jornada por ID
        if (!jornadaOptional.isPresent()) {
            return ResponseEntity.notFound().build(); // Retornar 404 si la jornada no existe
        }
        Jornada jornada = jornadaOptional.get();

        Turno turno = convertToTurnoEntity(turnoDto);
        turno.setFechaInicio(LocalDateTime.now()); // Establecer fecha y hora actual
        turno.setJornada(jornada); // Asignar la Jornada al Turno

        Turno saved = service.crearTurno(turno);
        return ResponseEntity.status(201).body(convertToTurnoDto(saved));
    }
    
    // Nuevo endpoint para crear una carrera dentro de un turno
    @PostMapping("/{turnoId}/carreras")
    public ResponseEntity<CarreraDto> crearCarreraEnTurno(
            @PathVariable int turnoId,
            @RequestBody CarreraDto carreraDto)
    {
        Optional<Turno> turnoOptional = service.buscarPorId(turnoId); // Asumiendo que TurnoService tiene buscarPorId
        if (!turnoOptional.isPresent()) {
            return ResponseEntity.notFound().build(); // Retornar 404 si el turno no existe
        }
        Turno turno = turnoOptional.get();

        // Verificar si el turno está abierto antes de añadir carreras
        if (turno.getEstado() == EstadoTurno.cerrado) {
             // Podrías retornar un 400 Bad Request o un 409 Conflict
            return ResponseEntity.badRequest().build(); // O ResponseEntity.status(409).build();
        }

        Carrera carrera = convertToCarreraEntity(carreraDto);
        carrera.setTurno(turno); // Asociar la carrera al turno encontrado

        Carrera savedCarrera = carreraService.crearCarrera(carrera); // Usar CarreraService para guardar

        return ResponseEntity.status(201).body(convertToCarreraDto(savedCarrera));
    }

    @GetMapping
    public List<TurnoDto> listar() {
        List<Turno> turnos = service.listarTurnos();
        return turnos.stream()
                       .map(this::convertToTurnoDto)
                       .collect(Collectors.toList());
    }

    @GetMapping("/{id}")
    public ResponseEntity<TurnoDto> get(@PathVariable int id) {
        return service.buscarPorId(id)
                   .map(this::convertToTurnoDto)
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
        return ResponseEntity.ok(convertToTurnoDto(updated));
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
    public ResponseEntity<TurnoDto> cerrarTurno(
            @PathVariable int id,
            @RequestBody TurnoDto datosDto
    ) {
        // Para cerrar el turno, solo necesitamos fechaFinal y kmFinal del DTO
        // Creamos una entidad parcial con estos datos para pasar al servicio
        Turno datosCierre = new Turno();
        datosCierre.setFechaFinal(datosDto.getFechaFinal());
        datosCierre.setKmFinal(datosDto.getKmFinal());
        
        // Usar un método en el servicio para cerrar el turno
        Optional<Turno> cerrado = service.cerrarTurno(id, datosCierre);
        
        return cerrado
                .map(this::convertToTurnoDto)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
}
