// JornadaController.java
package com.taxiday.controller;

import com.taxiday.model.Jornada;
import com.taxiday.repository.JornadaRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/jornadas")
public class JornadaController {

    private final JornadaRepository repo;
    public JornadaController(JornadaRepository repo) { this.repo = repo; }

    @PostMapping
    public ResponseEntity<Jornada> crear(@RequestBody Jornada j) {
        Jornada saved = repo.save(j);
        return ResponseEntity.status(201).body(saved);
    }

    @GetMapping
    public List<Jornada> listar() { return repo.findAll(); }

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
}
