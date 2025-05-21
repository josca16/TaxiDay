// src/main/java/com/taxiday/controller/TaxistaController.java
package com.taxiday.controller;

import com.taxiday.dto.TaxistaDto;
import com.taxiday.model.Taxista;
import com.taxiday.service.TaxistaService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.net.URI;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/taxistas")
public class TaxistaController {

    private final TaxistaService service;

    public TaxistaController(TaxistaService service) {
        this.service = service;
    }

    // Helper para convertir Taxista a TaxistaDto
    private TaxistaDto convertToDto(Taxista taxista) {
        if (taxista == null) return null;
        TaxistaDto taxistaDto = new TaxistaDto();
        taxistaDto.setIdTaxista(taxista.getIdTaxista());
        taxistaDto.setNombre(taxista.getNombre());
        taxistaDto.setApellidos(taxista.getApellidos());
        taxistaDto.setLicencia(taxista.getLicencia());
        taxistaDto.setEmail(taxista.getEmail());
        taxistaDto.setTelefono(taxista.getTelefono());
        return taxistaDto;
    }
    
     // Helper para convertir TaxistaDto a Taxista
    private Taxista convertToEntity(TaxistaDto taxistaDto) {
         if (taxistaDto == null) return null;
         Taxista taxista = new Taxista();
         taxista.setIdTaxista(taxistaDto.getIdTaxista());
         taxista.setNombre(taxistaDto.getNombre());
         taxista.setApellidos(taxistaDto.getApellidos());
         taxista.setLicencia(taxistaDto.getLicencia());
         taxista.setEmail(taxistaDto.getEmail());
         taxista.setTelefono(taxistaDto.getTelefono());
         taxista.setContrasena(taxistaDto.getContrasena());
         return taxista;
    }

    @PostMapping
    public ResponseEntity<TaxistaDto> crear(@RequestBody TaxistaDto taxistaDto) {
        Taxista taxista = convertToEntity(taxistaDto);
        // La contraseña ya se pasa desde el DTO a la entidad en convertToEntity,
        // y el TaxistaService se encarga de codificarla.
        Taxista saved = service.crearTaxista(taxista); 
        return ResponseEntity
                .created(URI.create("/api/taxistas/" + saved.getIdTaxista()))
                .body(convertToDto(saved));
    }

    @GetMapping
    public List<TaxistaDto> listar() {
        List<Taxista> taxistas = service.listarTaxistas();
        return taxistas.stream()
                       .map(this::convertToDto)
                       .collect(Collectors.toList());
    }

    @GetMapping("/{id}")
    public ResponseEntity<TaxistaDto> getById(@PathVariable Integer id) {
        Taxista t = service.buscarPorId(id);
        if (t == null) return ResponseEntity.notFound().build();
        return ResponseEntity.ok(convertToDto(t));
    }

    @GetMapping("/licencia/{licencia}")
    public ResponseEntity<TaxistaDto> porLicencia(@PathVariable String licencia) {
        Taxista t = service.buscarPorLicencia(licencia);
        if (t == null) return ResponseEntity.notFound().build();
        return ResponseEntity.ok(convertToDto(t));
    }

    @PutMapping("/{id}")
    public ResponseEntity<TaxistaDto> actualizar(
            @PathVariable Integer id,
            @RequestBody TaxistaDto cambiosDto
    ) {
         Taxista cambios = convertToEntity(cambiosDto);
        // Aquí deberías obtener la entidad existente de la base de datos
        // y aplicar los cambios del DTO a esa entidad.
        // No simplemente convertir el DTO a una nueva entidad.
        // Por simplicidad actual, usaremos el enfoque directo, pero es una mejora futura.
        Taxista updated = service.actualizarTaxista(id, cambios);
        if (updated == null) return ResponseEntity.notFound().build();
        return ResponseEntity.ok(convertToDto(updated));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> borrar(@PathVariable Integer id) {
        boolean ok = service.borrarTaxista(id);
        if (!ok) return ResponseEntity.notFound().build();
        return ResponseEntity.noContent().build();
    }
}
