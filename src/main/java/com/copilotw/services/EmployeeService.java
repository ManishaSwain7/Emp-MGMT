package com.copilotw.services;

import com.copilotw.models.Employee;
import com.copilotw.repositories.EmployeeRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class EmployeeService {
    private final EmployeeRepository employeeRepository;

    @Autowired
    public EmployeeService(EmployeeRepository employeeRepository) {
        this.employeeRepository = employeeRepository;
    }

    // Create
    public Employee saveEmployee(Employee employee) {
        return employeeRepository.save(employee);
    }

    // Read all
    public List<Employee> getAllEmployees() {
        return employeeRepository.findAll();
    }

    // Read one
    public Optional<Employee> getEmployeeById(Long id) {
        return employeeRepository.findById(id);
    }

    // Update
    public Employee updateEmployee(Employee employee) {
        return employeeRepository.save(employee);
    }

    // Delete
    public void deleteEmployee(Long id) {
        employeeRepository.deleteById(id);
    }
}
