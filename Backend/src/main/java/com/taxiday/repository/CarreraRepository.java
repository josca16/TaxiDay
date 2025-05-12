// CarreraRepository.java
package com.taxiday.repository;

import com.taxiday.model.Carrera;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface CarreraRepository extends JpaRepository<Carrera, Integer> {
  List<Carrera> findByTurnoIdTurno(int idTurno);
}
