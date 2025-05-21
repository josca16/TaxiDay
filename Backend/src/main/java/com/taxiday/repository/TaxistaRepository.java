package com.taxiday.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import com.taxiday.model.Taxista;
import java.util.List;

@Repository
public interface TaxistaRepository extends JpaRepository<Taxista, Integer> {
    Taxista findByLicencia(String licencia);
    Taxista findByLicenciaAndContrasena(String licencia, String contrasena);
}
