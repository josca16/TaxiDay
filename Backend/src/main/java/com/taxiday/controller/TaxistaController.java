// src/main/java/com/taxiday/controller/TaxistaController.java
package com.taxiday.controller;

import com.taxiday.dto.TaxistaDto;
import com.taxiday.model.Taxista;
import com.taxiday.service.TaxistaService;
import com.taxiday.util.DtoConverter;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.dao.DataIntegrityViolationException;

import java.net.URI;
import java.util.List;
import java.util.stream.Collectors;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/taxistas")
public class TaxistaController {

    private final TaxistaService service;

    public TaxistaController(TaxistaService service) {
        this.service = service;
    }

    @PostMapping
    public ResponseEntity<?> crear(@RequestBody TaxistaDto taxistaDto) {
        try {
            Taxista taxista = DtoConverter.toTaxistaEntity(taxistaDto);
        Taxista saved = service.crearTaxista(taxista); 
            return ResponseEntity.created(URI.create("/api/taxistas/" + saved.getIdTaxista()))
                               .body(DtoConverter.toTaxistaDto(saved));
        } catch (DataIntegrityViolationException e) {
            Map<String, String> response = new HashMap<>();
            response.put("error", "Ya existe un taxista con esa licencia");
            return ResponseEntity.badRequest().body(response);
        }
    }

    @GetMapping
    public List<TaxistaDto> listar() {
        List<Taxista> taxistas = service.listarTaxistas();
        return taxistas.stream()
                      .map(DtoConverter::toTaxistaDto)
                       .collect(Collectors.toList());
    }

    @GetMapping("/{id}")
    public ResponseEntity<TaxistaDto> get(@PathVariable int id) {
        Taxista taxista = service.buscarPorId(id);
        if (taxista == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(DtoConverter.toTaxistaDto(taxista));
    }

    @PutMapping("/{id}")
    public ResponseEntity<TaxistaDto> actualizar(@PathVariable int id,
                                               @RequestBody TaxistaDto cambiosDto) {
        Taxista cambios = DtoConverter.toTaxistaEntity(cambiosDto);
        Taxista updated = service.actualizarTaxista(id, cambios);
        if (updated == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(DtoConverter.toTaxistaDto(updated));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> borrar(@PathVariable int id) {
        boolean deleted = service.borrarTaxista(id);
        if (!deleted) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.noContent().build();
    }
}
