package com.taxiday.service.impl;

import com.taxiday.model.Taxista;
import com.taxiday.repository.TaxistaRepository;
import com.taxiday.service.TaxistaService;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class TaxistaServiceImpl implements TaxistaService {

    private final TaxistaRepository repo;

    public TaxistaServiceImpl(TaxistaRepository repo) {
        this.repo = repo;
    }

    @Override
    public Taxista crearTaxista(Taxista t) {
        // aún sin cifrar la contraseña, para empezar
        return repo.save(t);
    }

    @Override
    public List<Taxista> listarTaxistas() {
        return repo.findAll();
    }

    @Override
    public Taxista buscarPorId(int id) {
        return repo.findById(id).orElse(null);
    }


    @Override
    public Taxista buscarPorLicencia(String licencia) {
        // Aquí delegas a tu método del repo
        return repo.findByLicencia(licencia);
    }




    @Override
    public Taxista actualizarTaxista(int id, Taxista cambios) {
        Taxista orig = buscarPorId(id);
        if (orig == null) {
            return null;
        }
        // Copiamos solo los campos que queremos actualizar
        orig.setNombre(cambios.getNombre());
        orig.setApellidos(cambios.getApellidos());
        orig.setLicencia(cambios.getLicencia());
        orig.setContrasena(cambios.getContrasena());
        // …otros campos que tenga Taxista…
        return repo.save(orig);
    }

    @Override
    public boolean borrarTaxista(int id) {
        if (!repo.existsById(id)) {
            return false;
        }
        repo.deleteById(id);
        return true;
    }
}
