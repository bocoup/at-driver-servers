//
//  AudioUnitFactory.swift
//  MacOSATDriverServerExtension
//
//  Created by Z Goddard on 12/14/23.
//

import CoreAudioKit
import os

private let log = Logger(subsystem: "com.bundle.id.MacOSATDriverServerExtension", category: "AudioUnitFactory")

public class AudioUnitFactory: NSObject, AUAudioUnitFactory {
    var auAudioUnit: AUAudioUnit?

    private var observation: NSKeyValueObservation?

    public func beginRequest(with context: NSExtensionContext) {

    }

    @objc
    public func createAudioUnit(with componentDescription: AudioComponentDescription) throws -> AUAudioUnit {
        auAudioUnit = try MacOSATDriverServerExtensionAudioUnit(componentDescription: componentDescription, options: [])

        guard let audioUnit = auAudioUnit as? MacOSATDriverServerExtensionAudioUnit else {
            fatalError("Failed to create MacOSATDriverServerExtension")
        }

        audioUnit.setupParameterTree(MacOSATDriverServerExtensionParameterSpecs.createAUParameterTree())

        self.observation = audioUnit.observe(\.allParameterValues, options: [.new]) { object, change in
            guard let tree = audioUnit.parameterTree else { return }
            
            // This insures the Audio Unit gets initial values from the host.
            for param in tree.allParameters { param.value = param.value }
        }

        return audioUnit
    }
    
}
