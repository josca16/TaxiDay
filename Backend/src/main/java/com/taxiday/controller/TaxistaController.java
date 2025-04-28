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

    // 1) Registrar un nuevo taxista
    @PostMapping
    public ResponseEntity<Taxista> crear(@RequestBody Taxista taxista) {
        Taxista saved = service.crearTaxista(taxista);
        URI location = URI.create("/taxistas/" + saved.getIdTaxista());
        return ResponseEntity.created(location).body(saved);
    }

    // 2) Listar todos los taxistas
    @GetMapping
    public List<Taxista> listar() {
        return service.listarTaxistas();
    }

    // 3) Consultar un taxista por id
    @GetMapping("/{id}")
    public ResponseEntity<Taxista> getById(@PathVariable Integer id) {
        Taxista t = service.buscarPorId(id);
        if (t == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(t);
    }

    // 4) Consultar un taxista por licencia
    @GetMapping("/licencia/{licencia}")
    public ResponseEntity<Taxista> porLicencia(@PathVariable String licencia) {
        Taxista t = service.buscarPorLicencia(licencia);
        if (t == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(t);
    }

    // 5) Actualizar un taxista
    @PutMapping("/{id}")
    public ResponseEntity<Taxista> actualizar(
        @PathVariable Integer id,
        @RequestBody Taxista cambios
    ) {
        Taxista updated = service.actualizarTaxista(id, cambios);
        if (updated == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(updated);
    }

    // 6) Borrar un taxista
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> borrar(@PathVariable Integer id) {
        boolean ok = service.borrarTaxista(id);
        if (!ok) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.noContent().build();
    }
}
