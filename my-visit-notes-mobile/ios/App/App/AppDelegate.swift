import UIKit
import Capacitor

class VisitBridgeViewController: CAPBridgeViewController {
    override func capacitorDidLoad() {
        bridge?.registerPluginInstance(VisitPrintPlugin())
    }
}

@objc(VisitPrintPlugin)
public class VisitPrintPlugin: CAPPlugin, CAPBridgedPlugin {
    public let identifier = "VisitPrintPlugin"
    public let jsName = "VisitPrint"
    public let pluginMethods: [CAPPluginMethod] = [CAPPluginMethod(name: "printText", returnType: CAPPluginReturnPromise)]
    private var printing = false

    @objc func printText(_ call: CAPPluginCall) {
        guard let text = call.getString("text") else { call.reject("No text to print."); return }
        DispatchQueue.main.async {
            guard !self.printing, UIPrintInteractionController.isPrintingAvailable,
                  let view = self.bridge?.viewController?.view else {
                call.reject("Printing is unavailable or another print dialog is open."); return
            }
            self.printing = true
            let controller = UIPrintInteractionController.shared
            let info = UIPrintInfo(dictionary: nil)
            info.jobName = "My Visit Notes"
            info.outputType = .general
            controller.printInfo = info
            let formatter = UISimpleTextPrintFormatter(text: text)
            formatter.perPageContentInsets = UIEdgeInsets(top: 24, left: 24, bottom: 24, right: 24)
            controller.printFormatter = formatter
            let presented = controller.present(from: CGRect(x: view.bounds.midX, y: view.bounds.midY, width: 1, height: 1), in: view, animated: true) { _, completed, error in
                self.printing = false
                controller.printFormatter = nil
                if let error = error { call.reject(error.localizedDescription) }
                else { call.resolve(["completed": completed]) }
            }
            if !presented {
                self.printing = false
                controller.printFormatter = nil
                call.reject("Could not open printing.")
            }
        }
    }
}

@UIApplicationMain
class AppDelegate: UIResponder, UIApplicationDelegate {

    var window: UIWindow?
    private var privacyCover: UIView?

    func application(_ application: UIApplication, didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]?) -> Bool {
        // Override point for customization after application launch.
        return true
    }

    func applicationWillResignActive(_ application: UIApplication) {
        guard privacyCover == nil, let window = window else { return }
        let cover = UILabel(frame: window.bounds)
        cover.autoresizingMask = [.flexibleWidth, .flexibleHeight]
        cover.backgroundColor = UIColor(red: 245/255, green: 245/255, blue: 239/255, alpha: 1)
        cover.textColor = UIColor(red: 24/255, green: 55/255, blue: 47/255, alpha: 1)
        cover.text = "My Visit Notes"
        cover.textAlignment = .center
        cover.font = UIFont.preferredFont(forTextStyle: .title2)
        cover.isAccessibilityElement = false
        window.addSubview(cover)
        privacyCover = cover
        // Sent when the application is about to move from active to inactive state. This can occur for certain types of temporary interruptions (such as an incoming phone call or SMS message) or when the user quits the application and it begins the transition to the background state.
        // Use this method to pause ongoing tasks, disable timers, and invalidate graphics rendering callbacks. Games should use this method to pause the game.
    }

    func applicationDidEnterBackground(_ application: UIApplication) {
        // Use this method to release shared resources, save user data, invalidate timers, and store enough application state information to restore your application to its current state in case it is terminated later.
        // If your application supports background execution, this method is called instead of applicationWillTerminate: when the user quits.
    }

    func applicationWillEnterForeground(_ application: UIApplication) {
        // Called as part of the transition from the background to the active state; here you can undo many of the changes made on entering the background.
    }

    func applicationDidBecomeActive(_ application: UIApplication) {
        privacyCover?.removeFromSuperview()
        privacyCover = nil
        // Restart any tasks that were paused (or not yet started) while the application was inactive. If the application was previously in the background, optionally refresh the user interface.
    }

    func applicationWillTerminate(_ application: UIApplication) {
        // Called when the application is about to terminate. Save data if appropriate. See also applicationDidEnterBackground:.
    }

    func application(_ app: UIApplication, open url: URL, options: [UIApplication.OpenURLOptionsKey: Any] = [:]) -> Bool {
        // Called when the app was launched with a url. Feel free to add additional processing here,
        // but if you want the App API to support tracking app url opens, make sure to keep this call
        return ApplicationDelegateProxy.shared.application(app, open: url, options: options)
    }

    func application(_ application: UIApplication, continue userActivity: NSUserActivity, restorationHandler: @escaping ([UIUserActivityRestoring]?) -> Void) -> Bool {
        // Called when the app was launched with an activity, including Universal Links.
        // Feel free to add additional processing here, but if you want the App API to support
        // tracking app url opens, make sure to keep this call
        return ApplicationDelegateProxy.shared.application(application, continue: userActivity, restorationHandler: restorationHandler)
    }

}
