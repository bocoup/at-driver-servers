//
//  MacOSATDriverServerServiceProtocol.swift
//  MacOSATDriverServerService
//
//  Created by Z Goddard on 12/20/23.
//

import Foundation

@objc protocol MacOSATDriverServerServiceProtocol {
  func postInitEvent()
  func postSpeechEvent(speech: String)
  func postCancelEvent()
}
