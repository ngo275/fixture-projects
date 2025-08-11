package com.example.demo.controller;

import com.example.demo.model.Employee;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "*")
public class EmployeeController {
    
    private List<Employee> employees = new ArrayList<>();
    private Long nextId = 1L;

    public EmployeeController() {
        // Initialize with some sample data
        employees.add(new Employee("John", "Doe", "john.doe@example.com", "Engineering"));
        employees.add(new Employee("Jane", "Smith", "jane.smith@example.com", "Marketing"));
        employees.get(0).setId(nextId++);
        employees.get(1).setId(nextId++);
    }

    @GetMapping("/")
    public ResponseEntity<?> home() {
        return ResponseEntity.ok(new ApiResponse("Spring Boot API", "1.0.0"));
    }

    @GetMapping("/employees")
    public List<Employee> getAllEmployees() {
        return employees;
    }

    @GetMapping("/employees/{id}")
    public ResponseEntity<Employee> getEmployeeById(@PathVariable Long id) {
        Optional<Employee> employee = employees.stream()
                .filter(e -> e.getId().equals(id))
                .findFirst();
        
        return employee.map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/employees")
    public Employee createEmployee(@RequestBody Employee employee) {
        employee.setId(nextId++);
        employees.add(employee);
        return employee;
    }

    @PutMapping("/employees/{id}")
    public ResponseEntity<Employee> updateEmployee(@PathVariable Long id, @RequestBody Employee employeeDetails) {
        for (int i = 0; i < employees.size(); i++) {
            Employee employee = employees.get(i);
            if (employee.getId().equals(id)) {
                employee.setFirstName(employeeDetails.getFirstName());
                employee.setLastName(employeeDetails.getLastName());
                employee.setEmail(employeeDetails.getEmail());
                employee.setDepartment(employeeDetails.getDepartment());
                return ResponseEntity.ok(employee);
            }
        }
        return ResponseEntity.notFound().build();
    }

    @DeleteMapping("/employees/{id}")
    public ResponseEntity<?> deleteEmployee(@PathVariable Long id) {
        employees.removeIf(e -> e.getId().equals(id));
        return ResponseEntity.ok(new ApiResponse("Employee deleted", null));
    }

    static class ApiResponse {
        private String message;
        private String version;

        public ApiResponse(String message, String version) {
            this.message = message;
            this.version = version;
        }

        public String getMessage() { return message; }
        public String getVersion() { return version; }
    }
}