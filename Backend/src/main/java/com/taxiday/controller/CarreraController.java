// src/main/java/com/taxiday/controller/CarreraController.java
package com.taxiday.controller;

import com.taxiday.model.Carrera;
import com.taxiday.repository.CarreraRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/carreras")
public class CarreraController {

    private final CarreraRepository repo;
    public CarreraController(CarreraRepository repo) {
        this.repo = repo;
    }

    @PostMapping
    public ResponseEntity<Carrera> crear(@RequestBody Carrera c) {
        Carrera saved = repo.save(c);
        return ResponseEntity.status(201).body(saved);
    }

    @GetMapping
    public List<Carrera> listar() {
        return repo.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Carrera> get(@PathVariable int id) {
        return repo.findById(id)
                   .map(ResponseEntity::ok)
                   .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/{id}")
    public ResponseEntity<Carrera> actualizar(@PathVariable int id,
                                              @RequestBody Carrera cambios) {
        return repo.findById(id).map(c -> {
            // Si quisieras permitir modificar la fechaInicio:
            c.setFechaInicio(cambios.getFechaInicio());
            c.setImporteTotal(cambios.getImporteTotal());
            c.setImporteTaximetro(cambios.getImporteTaximetro());
            c.setTipoPago(cambios.getTipoPago());
            c.setTurno(cambios.getTurno());
            return ResponseEntity.ok(repo.save(c));
        }).orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> borrar(@PathVariable int id) {
        if (!repo.existsById(id)) return ResponseEntity.notFound().build();
        repo.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
