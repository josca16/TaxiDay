package com.taxiday.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import com.taxiday.model.Taxista;

@Repository
public interface TaxistaRepository extends JpaRepository<Taxista, Integer> {
    Taxista findByLicencia(String licencia);
}
