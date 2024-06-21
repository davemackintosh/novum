import type { ProjectEvents } from "$lib/cqrs"

class WebRTCConnection {
	private peerConnection: RTCPeerConnection
	private dataChannel: RTCDataChannel | null = null
	private config: RTCConfiguration = {
		iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
	}

	constructor(
		private localUUID: string,
		private remoteUUID: string,
	) {
		this.peerConnection = new RTCPeerConnection(this.config)
		this.setupPeerConnection()
	}

	private setupPeerConnection() {
		this.peerConnection.onicecandidate = (event) => {
			if (event.candidate) {
				this.saveSignalingData(this.localUUID, this.peerConnection.localDescription)
			}
		}

		this.peerConnection.ondatachannel = (event) => {
			this.dataChannel = event.channel
			this.setupDataChannel()
		}

		this.checkForRemoteSignalingData()
		window.addEventListener("storage", () => this.checkForRemoteSignalingData())
	}

	private setupDataChannel() {
		if (this.dataChannel) {
			this.dataChannel.onopen = () => {
				console.log("Data channel is open")
			}

			this.dataChannel.onmessage = (event) => {
				const receivedData = JSON.parse(event.data)
				console.log("Received:", receivedData)
			}
		}
	}

	private async checkForRemoteSignalingData() {
		const remoteSignalingData = this.getSignalingData(this.remoteUUID)
		if (remoteSignalingData && !this.peerConnection.currentRemoteDescription) {
			const remoteDesc = new RTCSessionDescription(remoteSignalingData)
			await this.peerConnection.setRemoteDescription(remoteDesc)
			if (remoteDesc.type === "offer") {
				const answer = await this.peerConnection.createAnswer()
				await this.peerConnection.setLocalDescription(answer)
				this.saveSignalingData(this.localUUID, answer)
			}
		}
	}

	private saveSignalingData(
		uuid: string,
		description: RTCSessionDescription | RTCSessionDescriptionInit | null,
	) {
		if (description) {
			sessionStorage.setItem(uuid, JSON.stringify(description))
		}
	}

	private getSignalingData(uuid: string): RTCSessionDescriptionInit | null {
		const data = sessionStorage.getItem(uuid)
		return data ? JSON.parse(data) : null
	}

	public async startConnection() {
		this.dataChannel = this.peerConnection.createDataChannel("jsonDataChannel")
		this.setupDataChannel()

		const offer = await this.peerConnection.createOffer()
		await this.peerConnection.setLocalDescription(offer)
		this.saveSignalingData(this.localUUID, offer)
	}

	public sendJsonPayload(payload: ProjectEvents) {
		if (this.dataChannel && this.dataChannel.readyState === "open") {
			this.dataChannel.send(JSON.stringify(payload))
			console.log("Sent:", payload)
		} else {
			console.error("Data channel is not open")
		}
	}
}

export default WebRTCConnection
