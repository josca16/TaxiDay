package com.taxiday.service.impl;

import com.taxiday.model.Taxista;
import com.taxiday.repository.TaxistaRepository;
import com.taxiday.service.TaxistaService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class TaxistaServiceImpl implements TaxistaService {
    private final TaxistaRepository repo;

    @Autowired
    public TaxistaServiceImpl(TaxistaRepository repo) { 
        this.repo = repo; 
    }

    @Override 
    public Taxista crearTaxista(Taxista t) { 
        return repo.save(t); 
    }
    @Override public List<Taxista> listarTaxistas() { return repo.findAll(); }
    @Override public Taxista buscarPorId(int id) { return repo.findById(id).orElse(null); }
    @Override public Taxista buscarPorLicencia(String licencia) { return repo.findByLicencia(licencia); }
    
    @Override
    public Taxista actualizarTaxista(int id, Taxista cambios) {
        Taxista orig = buscarPorId(id);
        if (orig == null) return null;
        orig.setNombre(cambios.getNombre());
        orig.setApellidos(cambios.getApellidos());
        orig.setLicencia(cambios.getLicencia());
        // Solo actualizar contraseña si se provee una nueva y no está vacía
        if (cambios.getContrasena() != null && !cambios.getContrasena().isEmpty()) {
        orig.setContrasena(cambios.getContrasena());
        }
        return repo.save(orig);
    }
    @Override public boolean borrarTaxista(int id) {
        if (!repo.existsById(id)) return false;
        repo.deleteById(id);
        return true;
    }
}
