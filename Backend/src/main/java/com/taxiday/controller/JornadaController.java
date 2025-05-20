// src/main/java/com/taxiday/controller/JornadaController.java
package com.taxiday.controller;

import com.taxiday.model.Jornada;
import com.taxiday.model.Jornada.EstadoJornada;
import com.taxiday.repository.JornadaRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/jornadas")
public class JornadaController {

    private final JornadaRepository repo;
    public JornadaController(JornadaRepository repo) {
        this.repo = repo;
    }

    @PostMapping
    public ResponseEntity<Jornada> crear(@RequestBody Jornada j) {
        Jornada saved = repo.save(j);
        return ResponseEntity.status(201).body(saved);
    }

    @GetMapping
    public List<Jornada> listar() {
        return repo.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Jornada> get(@PathVariable int id) {
        return repo.findById(id)
                   .map(ResponseEntity::ok)
                   .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/{id}")
    public ResponseEntity<Jornada> actualizar(@PathVariable int id,
                                              @RequestBody Jornada cambios) {
        return repo.findById(id).map(j -> {
            j.setFechaInicio(cambios.getFechaInicio());
            j.setFechaFinal(cambios.getFechaFinal());
            j.setEstado(cambios.getEstado());
            j.setTaxista(cambios.getTaxista());
            return ResponseEntity.ok(repo.save(j));
        }).orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> borrar(@PathVariable int id) {
        if (!repo.existsById(id)) return ResponseEntity.notFound().build();
        repo.deleteById(id);
        return ResponseEntity.noContent().build();
    }

    /** Cierra la jornada: el front envía {"fechaFinal":"2025-05-12T20:00:00"} */
    @PostMapping("/{id}/cerrar")
    public ResponseEntity<Jornada> cerrarJornada(
            @PathVariable int id,
            @RequestBody Jornada datos
    ) {
        return repo.findById(id).map(jornada -> {
            jornada.setFechaFinal(datos.getFechaFinal());
            jornada.setEstado(EstadoJornada.cerrada);
            repo.save(jornada);
            return ResponseEntity.ok(jornada);
        }).orElse(ResponseEntity.notFound().build());
    }
}
