import UIKit
import CarPlay
import MapKit

@available(iOS 12.0, *)
class CarPlaySceneDelegate: UIResponder, CPTemplateApplicationSceneDelegate {
    
    var interfaceController: CPInterfaceController?
    var carPlayMapTemplate: CPMapTemplate?
    
    func templateApplicationScene(_ templateApplicationScene: CPTemplateApplicationScene, 
                                 didConnect interfaceController: CPInterfaceController) {
        self.interfaceController = interfaceController
        
        // Create map template for CarPlay
        let mapTemplate = CPMapTemplate()
        mapTemplate.showPanningInterface = false
        mapTemplate.automaticallyHidesNavigationBar = false
        
        // Add speed monitoring button
        let speedButton = CPBarButton(title: "Старт") { [weak self] _ in
            self?.startSpeedMonitoring()
        }
        
        let pauseButton = CPBarButton(title: "Пауза") { [weak self] _ in
            self?.pauseSpeedMonitoring()
        }
        
        mapTemplate.leadingNavigationBarButtons = [speedButton]
        mapTemplate.trailingNavigationBarButtons = [pauseButton]
        
        // Show current speed as alert when monitoring
        self.carPlayMapTemplate = mapTemplate
        
        // Set the root template
        interfaceController.setRootTemplate(mapTemplate, animated: true) { _, _ in
            print("CarPlay connected successfully")
        }
        
        // Start location updates for CarPlay
        self.setupLocationTracking()
    }
    
    func templateApplicationScene(_ templateApplicationScene: CPTemplateApplicationScene, 
                                 didDisconnectInterfaceController interfaceController: CPInterfaceController) {
        self.interfaceController = nil
        self.carPlayMapTemplate = nil
    }
    
    // MARK: - Speed Monitoring Functions
    
    private func startSpeedMonitoring() {
        // Communicate with Flutter app to start monitoring
        NotificationCenter.default.post(name: NSNotification.Name("StartSpeedMonitoring"), object: nil)
        
        // Update button
        updateSpeedButton(title: "Активно", isActive: true)
        
        // Show speed panel
        showSpeedPanel()
    }
    
    private func pauseSpeedMonitoring() {
        // Communicate with Flutter app to pause monitoring
        NotificationCenter.default.post(name: NSNotification.Name("PauseSpeedMonitoring"), object: nil)
        
        // Update button
        updateSpeedButton(title: "Старт", isActive: false)
        
        // Hide speed panel
        hideSpeedPanel()
    }
    
    private func updateSpeedButton(title: String, isActive: Bool) {
        let button = CPBarButton(title: title) { [weak self] _ in
            if isActive {
                self?.pauseSpeedMonitoring()
            } else {
                self?.startSpeedMonitoring()
            }
        }
        
        carPlayMapTemplate?.leadingNavigationBarButtons = [button]
    }
    
    private func showSpeedPanel() {
        // Create navigation alert for speed display
        let speedAlert = CPNavigationAlert(titleVariants: ["Средна Скорост"], 
                                          subtitleVariants: nil, 
                                          imageSet: nil, 
                                          primaryAction: CPAlertAction(title: "ОК", style: .default) { _ in
            // Dismiss alert
        }, secondaryAction: nil, duration: 0)
        
        carPlayMapTemplate?.present(navigationAlert: speedAlert, animated: true)
    }
    
    private func hideSpeedPanel() {
        carPlayMapTemplate?.dismissNavigationAlert(animated: true)
    }
    
    private func setupLocationTracking() {
        // Listen for location updates from Flutter
        NotificationCenter.default.addObserver(
            self,
            selector: #selector(locationUpdated(_:)),
            name: NSNotification.Name("LocationUpdate"),
            object: nil
        )
        
        NotificationCenter.default.addObserver(
            self,
            selector: #selector(speedUpdated(_:)),
            name: NSNotification.Name("SpeedUpdate"),
            object: nil
        )
        
        NotificationCenter.default.addObserver(
            self,
            selector: #selector(zoneEntered(_:)),
            name: NSNotification.Name("ZoneEntered"),
            object: nil
        )
    }
    
    @objc private func locationUpdated(_ notification: Notification) {
        // Handle location updates for CarPlay map
        if let userInfo = notification.userInfo,
           let lat = userInfo["latitude"] as? Double,
           let lng = userInfo["longitude"] as? Double {
            
            let coordinate = CLLocationCoordinate2D(latitude: lat, longitude: lng)
            let region = MKCoordinateRegion(center: coordinate, latitudinalMeters: 5000, longitudinalMeters: 5000)
            
            // Update CarPlay map region (if available in future iOS versions)
        }
    }
    
    @objc private func speedUpdated(_ notification: Notification) {
        // Handle speed updates for CarPlay display
        if let userInfo = notification.userInfo,
           let currentSpeed = userInfo["currentSpeed"] as? Double,
           let averageSpeed = userInfo["averageSpeed"] as? Double,
           let speedLimit = userInfo["speedLimit"] as? Int {
            
            updateCarPlaySpeedDisplay(current: currentSpeed, average: averageSpeed, limit: speedLimit)
        }
    }
    
    @objc private func zoneEntered(_ notification: Notification) {
        // Handle zone entry notifications
        if let userInfo = notification.userInfo,
           let zoneName = userInfo["zoneName"] as? String {
            
            showZoneNotification(zoneName: zoneName)
        }
    }
    
    private func updateCarPlaySpeedDisplay(current: Double, average: Double, limit: Int) {
        let speedText = String(format: "Текуща: %.0f км/ч\nСредна: %.0f км/ч\nЛимит: %d км/ч", 
                              current, average, limit)
        
        let isOverLimit = average > Double(limit)
        let title = isOverLimit ? "⚠️ НАД ЛИМИТА" : "✅ В ЛИМИТА"
        
        // Update navigation alert with speed info
        let speedAlert = CPNavigationAlert(
            titleVariants: [title],
            subtitleVariants: [speedText],
            imageSet: nil,
            primaryAction: CPAlertAction(title: "ОК", style: .default) { _ in },
            secondaryAction: nil,
            duration: 2.0
        )
        
        // Show updated speed info
        carPlayMapTemplate?.present(navigationAlert: speedAlert, animated: true)
    }
    
    private func showZoneNotification(zoneName: String) {
        let alert = CPActionSheetTemplate(
            title: "Влизане в зона",
            message: zoneName,
            actions: [
                CPAlertAction(title: "ОК", style: .default) { _ in }
            ]
        )
        
        interfaceController?.presentTemplate(alert, animated: true) { _, _ in }
    }
    
    deinit {
        NotificationCenter.default.removeObserver(self)
    }
}