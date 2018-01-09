import React from 'react';
import ReactDom from 'react-dom';

import '../style/style.css';

import projectData from './data.json';

const images = [
	'./images/people.png',
	'./images/mountain.png',
	'./images/cloud.png',
	'./images/ground.png',
	'./images/pipe.png',
	'./images/trees.png',
	'./images/project.png',
	'./images/project-demo-0.png',
	'./images/project-demo-1.png',
	'./images/project-demo-2.png',
	'./images/project-demo-3.png'
];

/*
 * 资源监视器
 */
const Resource = {
	checkImage(src, callback) {
		let image = new Image();
		image.addEventListener('load', callback);
		image.addEventListener('error', (e) => {
			console.log(e);
		});
		image.src = src;
		return image;
	},
	checkLoading(images, callback) {
		let total = images.length;
		let finish = 0;
		this.images = [];
		let self = this;
		if (total === 0) {
			return callback([]);
		}
		for (let i = 0; i < images.length; i++) {
			let src = images[i];
			self.images[i] = self.checkImage(src, () => {
				finish++;
				if (finish === total) {
					callback(self.images);
				}
			})
		}
	}
}
/*
 * 场景 Scene
 */
const Scene = {
	getSceneWidth: () => {
		return $('.layer').width() - $('.content').width();
	},
	move: (curPosition) => {
		$('.layer').css({
			left: -curPosition
		});
		$('.mountain').css({
			left: curPosition * 0.75 - 100
		});
		$('.cloud').css({
			left: curPosition * 0.95
		});
	}
}
/*
 * 主角 Me
 */
const actionFrameMap = {
	static: 0,
	walk: 1,
	stand: 2,
	jump: 3
};

const Me = {
	init() {
		this.direction = 'right';
		this.oneFrameSize = 200; // 动作图片尺寸
		this.jumpHeight = 150; //跳跃高度
		this.peopleBottomEdge = 70; // 人物距离底部距离
		this.peopleRightEdge = 200; // 人物右边距离边界距离
		this.peopleLeftEdge = 80; // 人物左边距离边界距离
	},
	setDirection(distance) {
		if (distance > 0) {
			this.distance = 'right';
			$('.me').css('top', '0');
		} else {
			this.distance = 'left';
			$('.me').css('top', '-200px')
		}
	},
	/*
	 * 设置帧
	 */
	setFrame(action) {
		let nextFrame = -actionFrameMap[action] * this.oneFrameSize;
		$('.me').css({
			left: nextFrame
		})
	},
	actionFrames(frames, callback) {
		let self = this;
		if (frames.length === 0 || !frames[0]) {
			callback();
			return;
		}
		let nextAction = frames.shift();
		this.setFrame(nextAction);
		setTimeout(function() {
			self.actionFrames(frames, callback);
		}, 200);
	},
	walk() {
		let self = this;
		if (this.isJumping || this.isMoving) {
			return;
		}
		this.isMoving = true;
		let nextFrame = ['static', 'walk', 'stand'];
		Me.actionFrames(nextFrame, () => {
			self.isMoving = false;
		});
	},
	jump(item, downBlock) {
		let self = this;
		this.setFrame('jump');
		this.isJumping = true;
		let bottom = $('.content').height() - item.offsetTop + this.jumpHeight;
		$('.people').stop().animate({
			bottom: bottom
		}, 200, () => {
			downBlock && self.downBlock(item);
		});
	},
	/*
	 * 检测跳起以及跳下管子
	 */
	checkJump(curPosition, prePosition) {
		for (let i = 0; i < $('.block').length; i++) {
			let item = $('.block')[i];
			let itemX = item.offsetLeft; // 管子位置
			let itemWidth = item.offsetWidth; // 管子宽度

			// 起跳条件
			let rightNeedJump = (prePosition + this.peopleRightEdge <= itemX) && (curPosition + this.peopleRightEdge > itemX);
			let leftNeedJump = (prePosition + this.peopleLeftEdge >= itemX + itemWidth) && (curPosition + this.peopleLeftEdge < itemX + itemWidth);

			if (rightNeedJump || leftNeedJump) {
				let needDownBlock = (curPosition > itemX - this.peopleRightEdge) && (curPosition < itemX + itemWidth - this.peopleLeftEdge);
				this.jump(item, needDownBlock);
			}

			// 跳下管子条件
			let rightNeedDrop = (prePosition + this.peopleLeftEdge <= itemX + itemWidth) && (curPosition + this.peopleLeftEdge > itemX + itemWidth);
			let leftNeedDrop = (prePosition + this.peopleRightEdge > itemX) && (curPosition + this.peopleRightEdge) <= itemX;
			if (rightNeedDrop || leftNeedDrop) {
				this.drop(item);
			}
		}
	},
	downBlock(item) {
		let self = this
		// 据说这里多减 14 会好点
		let bottom = $('.content').height() - item.offsetTop - 14;
		$('.people').stop().animate({
			bottom: bottom
		}, 200, () => {
			self.setFrame('static');
			self.isJumping = false;
		});
	},
	drop(item) {
		let self = this;
		this.setFrame('jump');
		$('.people').stop().animate({
			bottom: this.peopleBottomEdge,
		}, 200, function() {
			self.setFrame('static');
			self.isJumping = false;
		});
	}
};
const Main = {
	init() {
		let self = this;
		Me.init();
		$(window).scrollTop(0);
		Resource.checkLoading(images, function(result) {
			$('.loading').fadeOut();
			self.bindEvent();
		})
	},
	bindEvent: () => {
		let curPosition = 0; // 当前位置
		let prePosition = 0; // 之前位置

		$(window).on('scroll', () => {
			curPosition = $(window).scrollTop();
			let distance = curPosition - prePosition;
			Me.setDirection(distance);
			Scene.move(curPosition);
			Me.checkJump(curPosition, prePosition);
			Me.walk();

			prePosition = curPosition;
		});
		$('.resume-start').on('click', (e) => {
			$('.intro').fadeOut();
			$('#page').css({
				height: Scene.getSceneWidth()
			});
		});
		$(window).on('resize', () => {
			$('#page').css({
				height: Scene.getSceneWidth()
			});
		});
	}
};

Main.init();


class Loading extends React.Component {
	render() {
		return (
			<div>
				<div id="page"></div>
				<div className="loading">
					<div className="loading-list">
						<span className="point"></span>
						<span className="point"></span>
						<span className="point"></span>
						<span className="point"></span>
						<span className="point"></span>
						<span className="point"></span>
						<span className="point"></span>
						<span className="point"></span>
					</div>
					<div className="loading-text">玩命加载中...</div>
				</div>
			</div>
		)
	}
}

class Intro extends React.Component {
	render() {
		return (
			<div className="intro">
				<p className="intro-title">各位老师好，我叫<br/><b className="intro-name">田海龙</b></p>
				<p className="intro-desc">我想应聘<br/><b className="intro-job">Web前端开发工程师</b><br/>一职，请各位老师查看我的简历</p>
				<button className="intro-btn resume-start">start</button>
				<p className="intro-tip">点击start按钮-开始滚动页面</p>
			</div>
		);
	}
}

class ProductDemo extends React.Component {
	constructor(props) {
		super(props);
	}
	getProductDemo() {
		for(let i = 0; i < Object.getOwnPropertyNames(projectData).length; i++) {
			require('../images/project-demo-' + i + '.png');
		}
	}
	render() {
		return(
			<div>
				<div className="project project-0">
					<h2 className="project-title">{this.props[0].projectTitle}</h2>
					<div className="project-desc-content">
						<p>{this.props[0].projectDescContent}</p>
					</div>
					<img className="project-img" src={this.props[0].projectImg} />
					<div className="project-desc-tech">
						<h3>技术栈</h3>
						<p>{this.props[0].projectDescTech}</p>
					</div>
					<div className="project-desc-preview">
						<h4><a href={this.props[0].projectUrl} target="_blank">点击查看</a></h4>
					</div>
				</div>

				<div className="project project-1">
					<h2 className="project-title">{this.props[1].projectTitle}</h2>
					<div className="project-desc-content">
						<p>{this.props[1].projectDescContent}</p>
					</div>
					<img className="project-img" src={this.props[1].projectImg} />
					<div className="project-desc-tech">
						<h3>技术栈</h3>
						<p>{this.props[1].projectDescTech}</p>
					</div>
					<div className="project-desc-preview">
						<h4><a href={this.props[1].projectUrl} target="_blank">点击查看</a></h4>
					</div>
				</div>
				<div className="project project-2">
					<h2 className="project-title">{this.props[2].projectTitle}</h2>
					<div className="project-desc-content">
						<p>{this.props[2].projectDescContent}</p>
					</div>
					<img className="project-img" src={this.props[2].projectImg} />
					<div className="project-desc-tech">
						<h3>技术栈</h3>
						<p>{this.props[2].projectDescTech}</p>
					</div>
					<div className="project-desc-preview">
						<h4><a href={this.props[2].projectUrl} target="_blank">点击查看</a></h4>
					</div>
				</div>
				<div className="project project-3">
					<h2 className="project-title">{this.props[3].projectTitle}</h2>
					<div className="project-desc-content">
						<p>{this.props[3].projectDescContent}</p>
					</div>
					<img className="project-img" src={this.props[3].projectImg} />
					<div className="project-desc-tech">
						<h3>技术栈</h3>
						<p>{this.props[3].projectDescTech}</p>
					</div>
					<div className="project-desc-preview">
						<h4><a href={this.props[3].projectUrl} target="_blank">点击查看</a></h4>
					</div>
				</div>
				<div className="project ending">
					<h1>感谢观赏</h1>
					<a href="mailto:2553292615@qq.com"><button className="ending-btn">Email: 2553292615@qq.com</button></a><br/>
					<a href="tel:15144304511"><button className="ending-btn">Tel: 15144304511</button></a><br/>
					<a href="https://www.dark-wing.com/" target="_blank"><button className="ending-btn">Blog</button></a><br/>
					<a href="https://github.com/darkwing0605" target="_blank"><button className="ending-btn">GitHub</button></a>
				</div>
			</div>
		)
	}
}

class Content extends React.Component {
	constructor(props) {
		super(props);
	}
	render() {
		return (
			<div className="content">
				<div className="layer">
					<div className="cloud"></div>
					<div className="mountain"></div>
					<div className="trees"></div>
					<div className="ground"></div>
					<div className="block block1"></div>
					<div className="block block2"></div>
					<div className="block block3"></div>
					<div className="block block4"></div>
					<div className="block block5"></div>
					<ProductDemo {...projectData} />
				</div>
				<div className="people">
					<div className="me"></div>
				</div>
			</div>
		)
	}
}

ReactDOM.render(
	<div>
		<Loading />
		<Intro />
		<Content />
	</div>,
	document.getElementById('root')
);
