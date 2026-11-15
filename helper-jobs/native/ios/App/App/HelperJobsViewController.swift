import Capacitor
import UIKit

/// The app's main screen: Capacitor's web view, with Helper Jobs' own device plugin added.
class HelperJobsViewController: CAPBridgeViewController {
    override open func capacitorDidLoad() {
        bridge?.registerPluginInstance(HelperJobsDevicePlugin())
    }
}
