import AVFoundation
import Capacitor
import UIKit

/// Connects the Helper Jobs pages to the iPad: the print screen, the share sheet for saved files,
/// keeping the screen on, and the device voice. Keeping helpers in the app uses Guided Access.
@objc(HelperJobsDevicePlugin)
public class HelperJobsDevicePlugin: CAPPlugin, CAPBridgedPlugin, AVSpeechSynthesizerDelegate {
    public let identifier = "HelperJobsDevicePlugin"
    public let jsName = "HelperJobsDevice"
    public let pluginMethods: [CAPPluginMethod] = [
        CAPPluginMethod(name: "voices", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "speak", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "stopSpeaking", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "print", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "keepAwake", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "pinApp", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "unpinApp", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "pinState", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "saveFile", returnType: CAPPluginReturnPromise)
    ]

    private let synthesizer = AVSpeechSynthesizer()
    private var speakingCall: CAPPluginCall?

    override public func load() {
        synthesizer.delegate = self
    }

    @objc func voices(_ call: CAPPluginCall) {
        let wanted = ["en", "hi", "es"]
        let list = AVSpeechSynthesisVoice.speechVoices()
            .filter { voice in wanted.contains { voice.language.hasPrefix($0) } }
            .map { ["lang": $0.language, "name": $0.name] }
        call.resolve(["voices": list])
    }

    @objc func speak(_ call: CAPPluginCall) {
        let text = call.getString("text") ?? ""
        let lang = call.getString("lang") ?? "en-US"
        let rate = Float(call.getDouble("rate") ?? 1)
        DispatchQueue.main.async {
            self.speakingCall?.resolve()
            self.synthesizer.stopSpeaking(at: .immediate)
            let utterance = AVSpeechUtterance(string: text)
            utterance.voice = AVSpeechSynthesisVoice(language: lang)
            utterance.rate = max(AVSpeechUtteranceMinimumSpeechRate, min(AVSpeechUtteranceMaximumSpeechRate, AVSpeechUtteranceDefaultSpeechRate * rate))
            self.speakingCall = call
            self.synthesizer.speak(utterance)
        }
    }

    @objc func stopSpeaking(_ call: CAPPluginCall) {
        DispatchQueue.main.async {
            self.synthesizer.stopSpeaking(at: .immediate)
            self.speakingCall?.resolve()
            self.speakingCall = nil
            call.resolve()
        }
    }

    public func speechSynthesizer(_ synthesizer: AVSpeechSynthesizer, didFinish utterance: AVSpeechUtterance) {
        speakingCall?.resolve()
        speakingCall = nil
    }

    @objc func print(_ call: CAPPluginCall) {
        let name = call.getString("name") ?? "Helper Jobs"
        DispatchQueue.main.async {
            guard let webView = self.bridge?.webView, let view = self.bridge?.viewController?.view else {
                call.reject("This iPad cannot print right now.")
                return
            }
            let info = UIPrintInfo(dictionary: nil)
            info.outputType = .general
            info.jobName = name
            let printer = UIPrintInteractionController.shared
            printer.printInfo = info
            printer.printFormatter = webView.viewPrintFormatter()
            printer.present(from: CGRect(x: view.bounds.midX, y: view.bounds.midY, width: 1, height: 1), in: view, animated: true, completionHandler: nil)
            call.resolve()
        }
    }

    @objc func keepAwake(_ call: CAPPluginCall) {
        let on = call.getBool("on") ?? false
        DispatchQueue.main.async {
            UIApplication.shared.isIdleTimerDisabled = on
            call.resolve()
        }
    }

    // On the iPad, Guided Access keeps helpers in the app; the app shows the coordinator how to turn it on.
    @objc func pinApp(_ call: CAPPluginCall) { call.reject("Use Guided Access on the iPad.") }
    @objc func unpinApp(_ call: CAPPluginCall) { call.reject("Use Guided Access on the iPad.") }
    @objc func pinState(_ call: CAPPluginCall) {
        DispatchQueue.main.async {
            call.resolve(["supported": false, "pinned": UIAccessibility.isGuidedAccessEnabled])
        }
    }

    @objc func saveFile(_ call: CAPPluginCall) {
        let raw = call.getString("name") ?? "helper-jobs-file"
        let name = raw.components(separatedBy: CharacterSet(charactersIn: "/\\:")).joined(separator: "-")
        guard let data = Data(base64Encoded: call.getString("data") ?? "") else {
            call.reject("Could not save the file.")
            return
        }
        let url = FileManager.default.temporaryDirectory.appendingPathComponent(name)
        do { try data.write(to: url, options: .atomic) } catch {
            call.reject("Could not save the file.")
            return
        }
        DispatchQueue.main.async {
            guard let controller = self.bridge?.viewController, let view = controller.view else {
                call.reject("Could not open the share sheet.")
                return
            }
            let sheet = UIActivityViewController(activityItems: [url], applicationActivities: nil)
            sheet.popoverPresentationController?.sourceView = view
            sheet.popoverPresentationController?.sourceRect = CGRect(x: view.bounds.midX, y: view.bounds.midY, width: 1, height: 1)
            controller.present(sheet, animated: true)
            call.resolve(["name": name])
        }
    }
}
