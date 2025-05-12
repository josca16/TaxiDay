// src/main/java/com/taxiday/controller/TaxistaController.java
package com.taxiday.controller;

import com.taxiday.model.Taxista;
import com.taxiday.service.TaxistaService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.net.URI;
import java.util.List;

@RestController
@RequestMapping("/taxistas")
public class TaxistaController {

    private final TaxistaService service;

    public TaxistaController(TaxistaService service) {
        this.service = service;
    }

    @PostMapping
    public ResponseEntity<Taxista> crear(@RequestBody Taxista taxista) {
        Taxista saved = service.crearTaxista(taxista);
        return ResponseEntity
                .created(URI.create("/taxistas/" + saved.getIdTaxista()))
                .body(saved);
    }

    @GetMapping
    public List<Taxista> listar() {
        return service.listarTaxistas();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Taxista> getById(@PathVariable Integer id) {
        Taxista t = service.buscarPorId(id);
        if (t == null) return ResponseEntity.notFound().build();
        return ResponseEntity.ok(t);
    }

    @GetMapping("/licencia/{licencia}")
    public ResponseEntity<Taxista> porLicencia(@PathVariable String licencia) {
        Taxista t = service.buscarPorLicencia(licencia);
        if (t == null) return ResponseEntity.notFound().build();
        return ResponseEntity.ok(t);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Taxista> actualizar(
            @PathVariable Integer id,
            @RequestBody Taxista cambios
    ) {
        Taxista updated = service.actualizarTaxista(id, cambios);
        if (updated == null) return ResponseEntity.notFound().build();
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> borrar(@PathVariable Integer id) {
        boolean ok = service.borrarTaxista(id);
        if (!ok) return ResponseEntity.notFound().build();
        return ResponseEntity.noContent().build();
    }
}
