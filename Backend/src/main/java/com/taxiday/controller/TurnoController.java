// src/main/java/com/taxiday/controller/TurnoController.java
package com.taxiday.controller;

import com.taxiday.model.Turno;
import com.taxiday.model.Turno.EstadoTurno;
import com.taxiday.repository.TurnoRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/turnos")
public class TurnoController {

    private final TurnoRepository repo;
    public TurnoController(TurnoRepository repo) {
        this.repo = repo;
    }

    @PostMapping
    public ResponseEntity<Turno> crear(@RequestBody Turno t) {
        Turno saved = repo.save(t);
        return ResponseEntity.status(201).body(saved);
    }

    @GetMapping
    public List<Turno> listar() {
        return repo.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Turno> get(@PathVariable int id) {
        return repo.findById(id)
                   .map(ResponseEntity::ok)
                   .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/{id}")
    public ResponseEntity<Turno> actualizar(@PathVariable int id,
                                            @RequestBody Turno cambios) {
        return repo.findById(id).map(t -> {
            t.setKmInicial(cambios.getKmInicial());
            t.setKmFinal(cambios.getKmFinal());
            t.setFechaInicio(cambios.getFechaInicio());
            t.setFechaFinal(cambios.getFechaFinal());
            t.setEstado(cambios.getEstado());
            t.setJornada(cambios.getJornada());
            return ResponseEntity.ok(repo.save(t));
        }).orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> borrar(@PathVariable int id) {
        if (!repo.existsById(id)) return ResponseEntity.notFound().build();
        repo.deleteById(id);
        return ResponseEntity.noContent().build();
    }

    /** Cierra un turno: front envía {"fechaFinal":"2025-05-12T18:30:00","kmFinal":123.4} */
    @PostMapping("/{id}/cerrar")
    public ResponseEntity<Turno> cerrarTurno(
            @PathVariable int id,
            @RequestBody Turno datos
    ) {
        return repo.findById(id).map(turno -> {
            turno.setFechaFinal(datos.getFechaFinal());
            turno.setKmFinal(datos.getKmFinal());
            turno.setEstado(EstadoTurno.cerrado);
            repo.save(turno);
            return ResponseEntity.ok(turno);
        }).orElse(ResponseEntity.notFound().build());
    }
}
